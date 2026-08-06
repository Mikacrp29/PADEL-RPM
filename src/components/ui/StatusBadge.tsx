import { getSlotStatus, SLOT_STATUS_LABEL, SLOT_STATUS_COLOR } from '../../types';

export function StatusBadge({ count }: { count: number }) {
  const status = getSlotStatus(count);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-court-600 bg-court-800 px-2.5 py-1 text-xs font-medium text-mist-100"
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: SLOT_STATUS_COLOR[status] }}
      />
      {status === 'ready' ? '🎾 Match possible' : SLOT_STATUS_LABEL[status]}
    </span>
  );
}
