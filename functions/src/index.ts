import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Match the Firestore database region so functions run close to the data
// they read/write (lower latency, no cross-region cost).
setGlobalOptions({ region: 'europe-west1' });

const resendApiKey = defineSecret('RESEND_API_KEY');
const FROM_EMAIL = 'Padel Ensemble <notifications@padelensemble.com>';

// Only this account can call getAdminStats — checked against the caller's
// verified Firebase Auth token, not anything the client sends, so it can't
// be spoofed by editing request data.
const ADMIN_EMAIL = 'mikacrupi@gmail.com';

interface StoredParticipant {
  name: string;
  uid?: string;
  club?: string;
}

interface UserProfileDoc {
  email?: string;
  nickname?: string;
  notifyByEmail?: boolean;
}

/**
 * Fires on every write to a slot document, but only actually does anything
 * the moment the participant count transitions INTO exactly 4 — not on
 * every subsequent edit to an already-full slot, and not when someone
 * leaves a slot that happened to already be at 4 (shouldn't happen given
 * the app's own 4-player cap, but guarded regardless).
 */
export const notifyOnSlotFull = onDocumentUpdated(
  { document: 'groups/{groupId}/slots/{slotId}', secrets: [resendApiKey] },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const beforeCount: number = (before.participants ?? []).length;
    const afterCount: number = (after.participants ?? []).length;

    if (beforeCount === 4 || afterCount !== 4) return;

    const groupId = event.params.groupId;
    const groupSnap = await db.doc(`groups/${groupId}`).get();
    const groupName: string = groupSnap.exists ? (groupSnap.data()?.name ?? 'ton groupe') : 'ton groupe';

    const participants: StoredParticipant[] = after.participants ?? [];
    const startDate: Date = after.start?.toDate?.() ?? new Date();

    const dateLabel = startDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const timeLabel = startDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const recipients = participants.filter((p) => p.uid);

    await Promise.all(
      recipients.map(async (participant) => {
        try {
          const userSnap = await db.doc(`users/${participant.uid}`).get();
          if (!userSnap.exists) return;
          const profile = userSnap.data() as UserProfileDoc;
          if (!profile.notifyByEmail || !profile.email) return;

          await sendSlotFullEmail(
            resendApiKey.value(),
            profile.email,
            groupName,
            dateLabel,
            timeLabel
          );
        } catch (err) {
          // One failed email (bad address, Resend hiccup) should never
          // block notifying the other players in the same slot.
          logger.error('Failed to notify participant', { uid: participant.uid, err });
        }
      })
    );
  }
);

async function sendSlotFullEmail(
  apiKey: string,
  to: string,
  groupName: string,
  dateLabel: string,
  timeLabel: string
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: `🎾 Match complet dans ${groupName} !`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p>Bonne nouvelle 🎉</p>
          <p>
            Votre créneau du <strong>${dateLabel} à ${timeLabel}</strong>
            dans <strong>${groupName}</strong> est maintenant complet (4/4 joueurs).
          </p>
          <p>🎾 Ça va être un bon match !</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error ${response.status}: ${body}`);
  }
}

interface WeekBucket {
  weekStart: string; // ISO date (YYYY-MM-DD), Monday of that week
  groups: number;
  accounts: number;
  slots: number;
}

interface AdminStats {
  groupCount: number;
  accountCount: number;
  slotCount: number;
  weeklySeries: WeekBucket[];
}

const TREND_WEEKS = 12;

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  return date;
}

function buildWeekBucketStarts(weeks: number): Date[] {
  const currentWeekStart = startOfWeek(new Date());
  const starts: Date[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - i * 7);
    starts.push(d);
  }
  return starts;
}

function extractCreatedDates(
  snap: FirebaseFirestore.QuerySnapshot
): Date[] {
  return snap.docs
    .map((d) => d.data().createdAt as FirebaseFirestore.Timestamp | undefined)
    .filter((t): t is FirebaseFirestore.Timestamp => !!t)
    .map((t) => t.toDate());
}

function countPerWeek(dates: Date[], bucketStarts: Date[]): number[] {
  const counts = new Array(bucketStarts.length).fill(0) as number[];
  const bucketTimes = bucketStarts.map((d) => d.getTime());
  for (const date of dates) {
    const weekTime = startOfWeek(date).getTime();
    const idx = bucketTimes.indexOf(weekTime);
    // Dates older than the tracked window are intentionally dropped —
    // this trend is about recent activity, not full history (that's what
    // the totals above are for).
    if (idx >= 0) counts[idx]++;
  }
  return counts;
}

/**
 * Returns site-wide counts (and a 12-week activity trend) for the admin
 * page. Restricted to ADMIN_EMAIL only — checked against
 * `request.auth.token.email`, which Firebase Auth itself verifies
 * server-side before this function ever runs, so it cannot be forged by a
 * client claiming to be a different email.
 *
 * Uses the Admin SDK, which bypasses Firestore security rules entirely —
 * this is intentional and the only way to read the protected `users`
 * collection in aggregate without loosening its rules for everyone else.
 *
 * Note on cost/scale: computing the weekly trend requires reading every
 * group/user/slot document once (to read their `createdAt`), rather than
 * using cheaper count() aggregations — necessary since aggregation queries
 * can't group by date. Fine at today's scale; if the slots collection
 * grows into the tens of thousands, this should move to a scheduled
 * function that maintains a small precomputed stats document instead of
 * reading everything on every admin page load.
 */
export const getAdminStats = onCall<void, Promise<AdminStats>>(async (request) => {
  const callerEmail = request.auth?.token.email?.trim().toLowerCase();
  if (!request.auth || callerEmail !== ADMIN_EMAIL.toLowerCase()) {
    throw new HttpsError('permission-denied', 'Not authorized.');
  }

  const [groupsSnap, usersSnap, slotsSnap] = await Promise.all([
    db.collection('groups').select('createdAt').get(),
    db.collection('users').select('createdAt').get(),
    db.collectionGroup('slots').select('createdAt').get(),
  ]);

  const bucketStarts = buildWeekBucketStarts(TREND_WEEKS);
  const groupCounts = countPerWeek(extractCreatedDates(groupsSnap), bucketStarts);
  const accountCounts = countPerWeek(extractCreatedDates(usersSnap), bucketStarts);
  const slotCounts = countPerWeek(extractCreatedDates(slotsSnap), bucketStarts);

  const weeklySeries: WeekBucket[] = bucketStarts.map((d, i) => ({
    weekStart: d.toISOString().slice(0, 10),
    groups: groupCounts[i],
    accounts: accountCounts[i],
    slots: slotCounts[i],
  }));

  return {
    groupCount: groupsSnap.size,
    accountCount: usersSnap.size,
    slotCount: slotsSnap.size,
    weeklySeries,
  };
});