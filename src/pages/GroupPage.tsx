import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useGroup } from '../contexts/GroupContext';
import { useSlots } from '../hooks/useSlots';
import { useLocalIdentity } from '../hooks/useLocalIdentity';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useRecentGroups } from '../hooks/useRecentGroups';
import { Navbar } from '../components/layout/Navbar';
import { Dashboard } from '../components/layout/Dashboard';
import { GroupCalendar } from '../components/calendar/GroupCalendar';
import { CreateSlotModal } from '../components/calendar/CreateSlotModal';
import { SlotDetailsModal } from '../components/calendar/SlotDetailsModal';
import { createSlot, joinSlot, leaveSlot, deleteSlot } from '../firebase/slots';
import { touchGroupMemberCount } from '../firebase/groups';
import { trackEvent, eventDateParams } from '../lib/analytics';
import type { Slot } from '../types';
import { getSlotStatus } from '../types';
import type { TranslationKey } from '../i18n/translations';

type Filter = 'all' | 'ready' | 'upcoming' | 'mine';

const FILTER_KEY: Record<Filter, TranslationKey> = {
  all: 'filter.all',
  upcoming: 'filter.upcoming',
  ready: 'filter.ready',
  mine: 'filter.mine',
};

export function GroupPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { group, loading, error, loadGroup } = useGroup();
  const { nickname, setNickname, setLastGroupCode } = useLocalIdentity();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addRecent } = useRecentGroups();
  const { slots } = useSlots(group?.id ?? null);

  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (code && (!group || group.inviteCode !== code)) loadGroup(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (group) {
      document.title = `${group.name} · Padel Ensemble`;
      setLastGroupCode(group.inviteCode);
      addRecent(group.inviteCode, group.name);
    }
  }, [group, setLastGroupCode, addRecent]);

  // Keep the selected slot's data fresh as real-time updates come in.
  useEffect(() => {
    if (!selectedSlot) return;
    const fresh = slots.find((s) => s.id === selectedSlot.id);
    setSelectedSlot(fresh ?? null);
  }, [slots, selectedSlot?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredSlots = useMemo(() => {
    const now = new Date();
    return slots.filter((s) => {
      if (dateFilter) {
        const d = s.start.toDate();
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;
        if (iso !== dateFilter) return false;
      }
      if (filter === 'ready') return getSlotStatus(s.participants.length) === 'ready';
      if (filter === 'upcoming') return s.start.toDate() > now;
      if (filter === 'mine')
        return s.participants.some((p) => p.name.toLowerCase() === nickname.trim().toLowerCase());
      return true;
    });
  }, [slots, filter, dateFilter, nickname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-mist-300">
        {t('groupPage.loading')}
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-mist-300">{error ?? t('groupPage.notFound')}</p>
        <button
          onClick={() => navigate('/join')}
          className="text-sm text-ball underline underline-offset-4"
        >
          {t('groupPage.tryAnotherCode')}
        </button>
      </div>
    );
  }

  const handleCreateSlot = async (nick: string, start: Date, end: Date, club: string) => {
    await createSlot(group.id, start, end, nick, club, user?.uid);
    if (nick.trim() && nick.trim() !== nickname) setNickname(nick.trim());
    await touchGroupMemberCount(group.id).catch(() => {});
    trackEvent('add_availability', { group_code: group.inviteCode, ...eventDateParams(start) });
  };

  const handleJoin = async (slot: Slot, nick: string, club: string) => {
    // Captured before the write: this is the count the Firestore document
    // has right now, so "was this the 3rd -> 4th player" is unambiguous
    // and attributed to this one action only — never re-derived from the
    // real-time listener, which every connected member also receives and
    // would otherwise fire match_ready once per open tab in the group.
    const wasThreeOfFour = slot.participants.length === 3;

    await joinSlot(group.id, slot.id, nick, club, user?.uid);
    setNickname(nick);

    trackEvent('add_availability', {
      group_code: group.inviteCode,
      ...eventDateParams(slot.start.toDate()),
    });

    if (wasThreeOfFour) {
      trackEvent('match_ready', {
        group_code: group.inviteCode,
        ...eventDateParams(slot.start.toDate()),
        player_count: 4,
      });
    }
  };

  const handleLeave = async (slot: Slot, nick: string) => {
    const participant = slot.participants.find(
      (p) => p.name.toLowerCase() === nick.toLowerCase()
    );
    if (!participant) return;
    // Always remove the participant first — Firestore's rules only allow
    // deleting a slot that already has 0 participants, so deleting before
    // this step gets silently rejected by the security rules (this was the
    // bug: leaving the last player did neither).
    await leaveSlot(group.id, slot.id, participant);
    trackEvent('remove_availability', { group_code: group.inviteCode });
    if (slot.participants.length === 1) {
      // That was the last participant — the slot is now empty, so remove
      // it too instead of leaving an orphaned empty entry on the calendar.
      await deleteSlot(group.id, slot.id);
    }
  };

  const handleDelete = async (slot: Slot) => {
    await deleteSlot(group.id, slot.id);
  };

  return (
    <div className="relative min-h-screen pb-16">
      <img
        src="/logo-watermark.png"
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 h-[120vh] w-[120vh] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
      />
      <Navbar group={group} nickname={nickname} onNicknameChange={setNickname} />

      <main className="relative mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <Dashboard slots={slots} memberCount={group.memberCount} />

        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(FILTER_KEY) as Filter[]).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                filter === value
                  ? 'bg-ball text-court-950 font-semibold'
                  : 'bg-court-800 text-mist-300 hover:text-mist-100'
              }`}
            >
              {t(FILTER_KEY[value])}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-full border border-court-600 bg-court-800 px-3 py-1.5">
            <Search size={14} className="text-mist-500" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-sm text-mist-100 outline-none [color-scheme:dark]"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-mist-500 hover:text-mist-100"
              >
                {t('filter.clear')}
              </button>
            )}
          </div>
        </div>

        <GroupCalendar
          slots={filteredSlots}
          onSelectRange={(start, end) => setRange({ start, end })}
          onSelectSlot={setSelectedSlot}
        />
      </main>

      <CreateSlotModal
        open={!!range}
        onClose={() => setRange(null)}
        range={range}
        defaultNickname={nickname}
        onCreate={handleCreateSlot}
      />

      <SlotDetailsModal
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        defaultNickname={nickname}
        bookingUrl={group.bookingUrl}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onDelete={handleDelete}
      />
    </div>
  );
}
