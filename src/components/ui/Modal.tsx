import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-court-950/80 backdrop-blur-sm animate-[fade-up_0.15s_ease-out]"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl border border-court-600 bg-court-900 p-6 shadow-2xl animate-pop',
          className
        )}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 className="font-display text-lg font-semibold text-mist-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-mist-500 transition-colors hover:bg-court-800 hover:text-mist-100"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
