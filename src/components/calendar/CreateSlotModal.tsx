import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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
      setError('Indique ton nom ou surnom.');
      return;
    }
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = new Date(range.start);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(range.start);
    end.setHours(eh, em, 0, 0);

    if (end <= start) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onCreate(nickname.trim(), start, end, club.trim());
      onClose();
    } catch {
      setError('Impossible de créer le créneau. Réessaie.');
    } finally {
      setSubmitting(false);
    }
  };

  const dateLabel = range.start.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouveau créneau">
      <p className="mb-4 text-sm capitalize text-mist-300">{dateLabel}</p>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-mist-300">Nom ou surnom</label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ex. Julien"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm text-mist-300">Heure de début</label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm text-mist-300">Heure de fin</label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-mist-300">
            Club proposé <span className="text-mist-500">(optionnel)</span>
          </label>
          <Input
            value={club}
            onChange={(e) => setClub(e.target.value)}
            placeholder="Ex. Padel Club Anderlecht"
          />
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Création…' : 'Créer le créneau'}
        </Button>
      </div>
    </Modal>
  );
}
