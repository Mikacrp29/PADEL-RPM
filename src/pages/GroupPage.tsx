import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useGroup } from '../contexts/GroupContext';
import { useSlots } from '../hooks/useSlots';
import { useLocalIdentity } from '../hooks/useLocalIdentity';
import { useFavoriteGroups } from '../hooks/useFavoriteGroups';
import { Navbar } from '../components/layout/Navbar';
import { Dashboard } from '../components/layout/Dashboard';
import { GroupCalendar } from '../components/calendar/GroupCalendar';
import { CreateSlotModal } from '../components/calendar/CreateSlotModal';
import { SlotDetailsModal } from '../components/calendar/SlotDetailsModal';
import { createSlot, joinSlot, leaveSlot, deleteSlot } from '../firebase/slots';
import { touchGroupMemberCount } from '../firebase/groups';
import type { Slot } from '../types';
import { getSlotStatus } from '../types';

type Filter = 'all' | 'ready' | 'upcoming' | 'mine';

export function GroupPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { group, loading, error, loadGroup } = useGroup();
 const { nickname, setNickname, setLastGroupCode } = useLocalIdentity();
  const { addGroup } = useFavoriteGroups();
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
      addGroup(group.inviteCode, group.name);
    }
  }, [group, setLastGroupCode, addGroup]);

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
        Chargement du groupe…
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-mist-300">{error ?? "Ce groupe n'existe pas."}</p>
        <button
          onClick={() => navigate('/join')}
          className="text-sm text-ball underline underline-offset-4"
        >
          Essayer un autre code
        </button>
      </div>
    );
  }

  const handleCreateSlot = async (nick: string, start: Date, end: Date) => {
    await createSlot(group.id, start, end, nick);
    if (nick.trim() && nick.trim() !== nickname) setNickname(nick.trim());
    await touchGroupMemberCount(group.id).catch(() => {});
  };

  const handleJoin = async (slot: Slot, nick: string) => {
    await joinSlot(group.id, slot.id, nick);
    setNickname(nick);
  };

 const handleLeave = async (slot: Slot, nick: string) => {
    const participant = slot.participants.find(
      (p) => p.name.toLowerCase() === nick.toLowerCase()
    );
    if (participant) await leaveSlot(group.id, slot.id, participant);
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
          {(
            [
              ['all', 'Tous'],
              ['upcoming', 'À venir'],
              ['ready', 'Matchs validés'],
              ['mine', 'Mes disponibilités'],
            ] as [Filter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                filter === value
                  ? 'bg-ball text-court-950 font-semibold'
                  : 'bg-court-800 text-mist-300 hover:text-mist-100'
              }`}
            >
              {label}
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
                effacer
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
