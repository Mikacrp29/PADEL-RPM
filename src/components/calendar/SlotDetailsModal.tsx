import { useState } from 'react';
import { Trash2, MapPin } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';
import type { Slot } from '../../types';
import { getSlotStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEvent, eventDateParams } from '../../lib/analytics';

interface SlotDetailsModalProps {
  slot: Slot | null;
  onClose: () => void;
  defaultNickname: string;
  bookingUrl?: string;
  onJoin: (slot: Slot, nickname: string, club: string) => Promise<void>;
  onLeave: (slot: Slot, nickname: string) => Promise<void>;
  onDelete: (slot: Slot) => Promise<void>;
}

export function SlotDetailsModal({
  slot,
  onClose,
  defaultNickname,
  bookingUrl,
  onJoin,
  onLeave,
  onDelete,
}: SlotDetailsModalProps) {
  const { t, language } = useLanguage();
  const [nickname, setNickname] = useState(defaultNickname);
  const [club, setClub] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!slot) return null;

  const alreadyIn = slot.participants.some(
    (p) => p.name.toLowerCase() === nickname.trim().toLowerCase()
  );
  const status = getSlotStatus(slot.participants.length);

  const handleClick = async () => {
    if (!nickname.trim()) {
      setError(t('createSlot.errorNoNickname'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (alreadyIn) {
        await onLeave(slot, nickname.trim());
      } else {
        if (slot.participants.some((p) => p.name.toLowerCase() === nickname.trim().toLowerCase())) {
          setError(t('slotDetails.errorDuplicate'));
          return;
        }
        await onJoin(slot, nickname.trim(), club.trim());
        setClub('');
      }
    } catch {
      setError(t('slotDetails.errorGeneric'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await onDelete(slot);
      onClose();
    } catch {
      setError(t('slotDetails.errorDeleteFailed'));
      setBusy(false);
    }
  };

  const handleBookCourt = () => {
    trackEvent('book_court', {
      group_code: slot.groupId,
      ...eventDateParams(slot.start.toDate()),
    });
  };

  const dateLocale = language === 'en' ? 'en-GB' : 'fr-FR';
  const dateLabel = slot.start.toDate().toLocaleDateString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeLabel = `${slot.start.toDate().toLocaleTimeString(dateLocale, {
    hour: '2-digit',
    minute: '2-digit',
  })} – ${slot.end.toDate().toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <Modal open={!!slot} onClose={onClose} title={t('slotDetails.title')}>
      <div className="mb-4 space-y-1">
        <p className="capitalize text-mist-100">{dateLabel}</p>
        <p className="font-mono text-sm text-mist-300">{timeLabel}</p>
      </div>

      <div className="mb-4">
        <StatusBadge count={slot.participants.length} />
      </div>

      {slot.participants.length === 0 && (
        <div className="mb-5">
          {confirmingDelete ? (
            <div className="flex items-center gap-2 rounded-xl border border-clay/40 bg-clay/10 p-3">
              <p className="flex-1 text-sm text-mist-100">
                {t('slotDetails.deleteEmptyConfirm')}
              </p>
              <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
                {t('slotDetails.cancel')}
              </Button>
              <Button size="sm" variant="danger" onClick={handleDelete} disabled={busy}>
                {busy ? t('slotDetails.deleting') : t('slotDetails.confirm')}
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center gap-1.5 text-sm text-mist-500 transition-colors hover:text-clay"
            >
              <Trash2 size={14} />
              {t('slotDetails.deleteSlot')}
            </button>
          )}
        </div>
      )}

      <div className="mb-5 space-y-2">
        <p className="text-sm text-mist-300">
          {t('slotDetails.playersRegistered')} ({slot.participants.length}/4)
        </p>
        {slot.participants.length === 0 ? (
          <p className="text-sm text-mist-500">{t('slotDetails.noOneYet')}</p>
        ) : (
          <ul className="space-y-1.5">
            {slot.participants.map((p) => (
              <li
                key={p.name}
                className="flex items-center gap-2 rounded-lg bg-court-800 px-3 py-2 text-sm text-mist-100"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ball/20 text-xs font-semibold text-ball">
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span>{p.name}</span>
                  {p.club && (
                    <span className="flex items-center gap-1 text-xs text-mist-500">
                      <MapPin size={11} className="shrink-0" />
                      <span className="truncate">{p.club}</span>
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {status === 'ready' && bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
          onClick={handleBookCourt}
          className="mb-4 block rounded-xl bg-slot-ready/15 border border-slot-ready/40 px-4 py-3 text-center text-sm font-semibold text-mist-100 transition-colors hover:bg-slot-ready/25"
        >
          {t('slotDetails.bookCourt')}
        </a>
      )}

      <div className="space-y-3">
        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('slotDetails.nicknamePlaceholder')}
        />
        {!alreadyIn && (
          <Input
            value={club}
            onChange={(e) => setClub(e.target.value)}
            placeholder={t('slotDetails.clubPlaceholder')}
          />
        )}
        {error && <p className="text-sm text-clay">{error}</p>}
        <Button
          className="w-full"
          size="lg"
          variant={alreadyIn ? 'danger' : 'primary'}
          onClick={handleClick}
          disabled={busy}
        >
          {busy ? t('slotDetails.wait') : alreadyIn ? t('slotDetails.leave') : t('slotDetails.join')}
        </Button>
      </div>
    </Modal>
  );
}
