import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface CreateSlotModalProps {
  open: boolean;
  onClose: () => void;
  range: { start: Date; end: Date } | null;
  defaultNickname: string;
  onCreate: (nickname: string, start: Date, end: Date, club: string) => Promise<void>;
}

function toTimeInput(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function CreateSlotModal({
  open,
  onClose,
  range,
  defaultNickname,
  onCreate,
}: CreateSlotModalProps) {
  const { t, language } = useLanguage();
  const [nickname, setNickname] = useState(defaultNickname);
  const [club, setClub] = useState('');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:30');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (range) {
      setStartTime(toTimeInput(range.start));
      setEndTime(toTimeInput(range.end));
    }
    setNickname(defaultNickname);
    setClub('');
    setError(null);
  }, [range, defaultNickname, open]);

  if (!range) return null;

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      setError(t('createSlot.errorNoNickname'));
      return;
    }
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = new Date(range.start);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(range.start);
    end.setHours(eh, em, 0, 0);

    if (end <= start) {
      setError(t('createSlot.errorTimeOrder'));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onCreate(nickname.trim(), start, end, club.trim());
      onClose();
    } catch {
      setError(t('createSlot.errorFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const dateLocale = language === 'en' ? 'en-GB' : 'fr-FR';
  const dateLabel = range.start.toLocaleDateString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Modal open={open} onClose={onClose} title={t('createSlot.title')}>
      <p className="mb-4 text-sm capitalize text-mist-300">{dateLabel}</p>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-mist-300">{t('createSlot.nickname')}</label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t('createSlot.nicknamePlaceholder')}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm text-mist-300">
              {t('createSlot.startTime')}
            </label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm text-mist-300">{t('createSlot.endTime')}</label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-mist-300">
            {t('createSlot.club')} <span className="text-mist-500">{t('createSlot.optional')}</span>
          </label>
          <Input
            value={club}
            onChange={(e) => setClub(e.target.value)}
            placeholder={t('createSlot.clubPlaceholder')}
          />
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? t('createSlot.creating') : t('createSlot.submit')}
        </Button>
      </div>
    </Modal>
  );
}
