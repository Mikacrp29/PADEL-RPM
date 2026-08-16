import { getSlotStatus, SLOT_STATUS_COLOR, type SlotStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';

const STATUS_KEY: Record<SlotStatus, TranslationKey> = {
  empty: 'status.empty',
  low: 'status.low',
  mid: 'status.mid',
  ready: 'status.ready',
};

export function StatusBadge({ count }: { count: number }) {
  const { t } = useLanguage();
  const status = getSlotStatus(count);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-court-600 bg-court-800 px-2.5 py-1 text-xs font-medium text-mist-100">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: SLOT_STATUS_COLOR[status] }}
      />
      {t(STATUS_KEY[status])}
    </span>
  );
}
