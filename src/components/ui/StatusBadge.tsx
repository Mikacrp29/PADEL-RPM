import { getSlotStatus, SLOT_STATUS_COLOR, SLOT_STATUS_LABEL_KEY } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export function StatusBadge({ count }: { count: number }) {
  const { t } = useLanguage();
  const status = getSlotStatus(count);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-court-600 bg-court-800 px-2.5 py-1 text-xs font-medium text-mist-100">
      <span
        className="h-2 w-2 rounded-full transition-colors duration-300"
        style={{ backgroundColor: SLOT_STATUS_COLOR[status] }}
      />
      {t(SLOT_STATUS_LABEL_KEY[status])}
    </span>
  );
}