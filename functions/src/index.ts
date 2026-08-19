import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Match the Firestore database region so the function runs close to the
// data it reads/writes (lower latency, no cross-region cost).
setGlobalOptions({ region: 'europe-west1' });

const resendApiKey = defineSecret('RESEND_API_KEY');
const FROM_EMAIL = 'Padel Ensemble <notifications@padelensemble.com>';

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
