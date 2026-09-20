import { ChevronRight, Plus } from 'lucide-react';
import type { Slot } from '../../types';
import { getSlotStatus, SLOT_STATUS_HEX } from '../../types';
import { PadelIcon } from '../ui/PadelIcon';
import { useLanguage } from '../../contexts/LanguageContext';

interface DaySlotListProps {
  slots: Slot[];
  onSelectSlot: (slot: Slot) => void;
  onCreateDefault: () => void;
}

function toTime(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const AVATAR_PALETTE = ['#c8f13c', '#3d7ac9', '#d68a3a', '#4fbf6b', '#c17a4d'];
function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function SlotCard({ slot, onSelect }: { slot: Slot; onSelect: () => void }) {
  const { t } = useLanguage();
  const count = slot.participants.length;
  const status = getSlotStatus(count);
  const ready = status === 'ready';
  const club = slot.participants.find((p) => p.club)?.club;

  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
        ready
          ? 'border-ball/50 bg-court-800 shadow-[0_0_16px_-4px_rgba(200,241,60,0.35)]'
          : 'border-court-700 bg-court-900 hover:border-court-600'
      }`}
    >
      <div className="flex shrink-0 flex-col items-start">
        <span className="font-mono text-lg font-bold leading-none text-mist-100">
          {toTime(slot.start.toDate())}
        </span>
        <span className="mt-1 font-mono text-xs leading-none text-mist-500">
          {toTime(slot.end.toDate())}
        </span>
      </div>

      <div className="h-10 w-px shrink-0 bg-court-700" />

      <div className="min-w-0 flex-1">
        {ready && (
          <span className="mb-1 inline-block rounded-full bg-ball/15 px-2 py-0.5 text-[11px] font-semibold text-ball">
            {t('status.ready')}
          </span>
        )}
        {club && (
          <div className="mb-1 flex items-center gap-1.5 text-sm text-mist-300">
            <PadelIcon size={13} className="shrink-0 text-mist-500" />
            <span className="truncate">{club}</span>
          </div>
        )}
        <div className="flex -space-x-2">
          {slot.participants.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-court-900 text-[10px] font-bold text-court-950"
              style={{ backgroundColor: avatarColor(p.name) }}
              title={p.name}
            >
              {p.name.trim().charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold"
          style={{
            backgroundColor: ready ? 'var(--color-ball)' : `${SLOT_STATUS_HEX[status]}33`,
            color: ready ? 'var(--color-court-950)' : SLOT_STATUS_HEX[status],
          }}
        >
          {count}/4
        </span>
        <ChevronRight size={16} className="text-mist-500" />
      </div>
    </button>
  );
}

export function DaySlotList({ slots, onSelectSlot, onCreateDefault }: DaySlotListProps) {
  const { t } = useLanguage();
  const sorted = [...slots].sort((a, b) => a.start.toMillis() - b.start.toMillis());

  if (sorted.length === 0) {
    return (
      <button
        onClick={onCreateDefault}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-court-600 py-8 text-mist-500 transition-colors hover:border-ball/50 hover:text-ball"
      >
        <Plus size={22} />
        <span className="text-sm">{t('calendar.noSlotsThisDay')}</span>
      </button>
    );
  }

  return (
    <div className="space-y-2.5">
      {sorted.map((slot) => (
        <SlotCard key={slot.id} slot={slot} onSelect={() => onSelectSlot(slot)} />
      ))}
    </div>
  );
}