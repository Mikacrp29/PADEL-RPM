import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';
import type { Slot } from '../../types';
import { getSlotStatus } from '../../types';

interface SlotDetailsModalProps {
  slot: Slot | null;
  onClose: () => void;
  defaultNickname: string;
  bookingUrl?: string;
  onJoin: (slot: Slot, nickname: string) => Promise<void>;
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
  const [nickname, setNickname] = useState(defaultNickname);
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
      setError('Indique ton nom ou surnom.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (alreadyIn) {
        await onLeave(slot, nickname.trim());
      } else {
        if (slot.participants.some((p) => p.name.toLowerCase() === nickname.trim().toLowerCase())) {
          setError('Ce surnom est déjà inscrit sur ce créneau.');
          return;
        }
        await onJoin(slot, nickname.trim());
      }
    } catch {
      setError('Une erreur est survenue. Réessaie.');
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
      setError('Impossible de supprimer ce créneau. Réessaie.');
      setBusy(false);
    }
  };

  const dateLabel = slot.start.toDate().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeLabel = `${slot.start.toDate().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })} – ${slot.end.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <Modal open={!!slot} onClose={onClose} title="Détails du créneau">
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
              <p className="flex-1 text-sm text-mist-100">Supprimer ce créneau vide ?</p>
              <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
                Annuler
              </Button>
              <Button size="sm" variant="danger" onClick={handleDelete} disabled={busy}>
                {busy ? 'Suppression…' : 'Confirmer'}
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center gap-1.5 text-sm text-mist-500 transition-colors hover:text-clay"
            >
              <Trash2 size={14} />
              Supprimer ce créneau
            </button>
          )}
        </div>
      )}

      <div className="mb-5 space-y-2">
        <p className="text-sm text-mist-300">Joueurs inscrits ({slot.participants.length}/4)</p>
        {slot.participants.length === 0 ? (
          <p className="text-sm text-mist-500">Personne pour l'instant.</p>
        ) : (
          <ul className="space-y-1.5">
            {slot.participants.map((p) => (
              <li
                key={p.name}
                className="flex items-center gap-2 rounded-lg bg-court-800 px-3 py-2 text-sm text-mist-100"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ball/20 text-xs font-semibold text-ball">
                  {p.name.charAt(0).toUpperCase()}
                </span>
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {status === 'ready' && bookingUrl && (
        
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-4 block rounded-xl bg-slot-ready/15 border border-slot-ready/40 px-4 py-3 text-center text-sm font-semibold text-mist-100 transition-colors hover:bg-slot-ready/25"
        >
          🎾 Réserver le terrain
        </a>
      )}

      <div className="space-y-3">
        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Ton nom ou surnom"
        />
        {error && <p className="text-sm text-clay">{error}</p>}
        <Button
          className="w-full"
          size="lg"
          variant={alreadyIn ? 'danger' : 'primary'}
          onClick={handleClick}
          disabled={busy}
        >
          {busy ? 'Un instant…' : alreadyIn ? '❌ Je ne suis plus disponible' : '➕ Je participe'}
        </Button>
      </div>
    </Modal>
  );
}
