import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useGroup } from '../contexts/GroupContext';
import { useSlots } from '../hooks/useSlots';
import { useLocalIdentity } from '../hooks/useLocalIdentity';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useRecentGroups } from '../hooks/useRecentGroups';
import { Navbar } from '../components/layout/Navbar';
import { GroupCalendar } from '../components/calendar/GroupCalendar';
import { CreateSlotModal } from '../components/calendar/CreateSlotModal';
import { SlotDetailsModal } from '../components/calendar/SlotDetailsModal';
import { createSlot, joinSlot, leaveSlot, deleteSlot } from '../firebase/slots';
import { touchGroupMemberCount } from '../firebase/groups';
import { trackEvent } from '../lib/analytics';
import type { Slot } from '../types';

export function GroupPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { group, loading, error, loadGroup } = useGroup();
  const { nickname, setNickname, setLastGroupCode } = useLocalIdentity();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { addRecent } = useRecentGroups();
  const { slots } = useSlots(group?.id ?? null);

  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

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
    trackEvent('add_availability');

    const dateLocale = language === 'en' ? 'en-GB' : 'fr-FR';
    const day = start.toLocaleDateString(dateLocale, { weekday: 'long' });
    const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    setConfirmation(`${day.charAt(0).toUpperCase() + day.slice(1)} · ${fmt(start)} → ${fmt(end)}`);
    window.setTimeout(() => setConfirmation(null), 3500);
  };

  // Same 19:00 / +1h30 default as GroupCalendar's month-view tap-to-create
  // (handleDateClick), so the button and the day-click path never diverge.
  const handleQuickCreate = () => {
    const start = new Date();
    start.setHours(19, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1, start.getMinutes() + 30);
    setRange({ start, end });
  };

  const handleJoin = async (slot: Slot, nick: string, club: string) => {
    const wasThreeOfFour = slot.participants.length === 3;

    await joinSlot(group.id, slot.id, nick, club, user?.uid);
    setNickname(nick);

    trackEvent('add_availability');

    if (wasThreeOfFour) {
      trackEvent('match_ready', { player_count: 4 });
    }
  };

  const handleLeave = async (slot: Slot, nick: string) => {
    const participant = slot.participants.find(
      (p) => p.name.toLowerCase() === nick.toLowerCase()
    );
    if (!participant) return;
    await leaveSlot(group.id, slot.id, participant);
    trackEvent('remove_availability');
    if (slot.participants.length === 1) {
      await deleteSlot(group.id, slot.id);
    }
  };

  const handleDelete = async (slot: Slot) => {
    await deleteSlot(group.id, slot.id);
  };

  return (
    <div className="relative min-h-screen pb-16">
      <img
        src="/logo-watermark.webp"
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 h-[80vh] w-[80vh] max-w-none -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.04] sm:h-[120vh] sm:w-[120vh] sm:opacity-[0.06]"
        style={{
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)',
        }}
      />
      <Navbar group={group} nickname={nickname} onNicknameChange={setNickname} />

            <main className="relative mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex justify-center">
          <Button size="lg" onClick={handleQuickCreate} className="rounded-full">
            <Plus size={18} />
            {t('createSlot.quickButton')}
          </Button>
        </div>

        <GroupCalendar
          slots={slots}
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
        onJoin={handleJoin}
        onLeave={handleLeave}
        onDelete={handleDelete}
      />

      {confirmation && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="pointer-events-auto animate-fade-up rounded-full border border-ball/40 bg-court-900 px-4 py-2.5 text-sm text-mist-100 shadow-[0_12px_30px_-8px_rgba(7,26,26,0.7)]">
            <span className="font-semibold text-ball">{t('createSlot.confirmed')}</span>
            <span className="text-mist-300"> · {confirmation}</span>
          </div>
        </div>
      )}
    </div>
  );
}