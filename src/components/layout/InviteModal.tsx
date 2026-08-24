import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEvent } from '../../lib/analytics';
import type { Group } from '../../types';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  group: Group;
}

export function InviteModal({ open, onClose, group }: InviteModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const inviteLink = `${window.location.origin}/join/${group.inviteCode}`;

  const copy = async (value: string, kind: 'code' | 'link') => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
    trackEvent('share_group', { group_code: group.inviteCode, method: kind });
  };

  return (
    <Modal open={open} onClose={onClose} title={t('invite.title')}>
      <p className="mb-5 text-sm text-mist-300">{t('invite.subtitle')}</p>

      <p className="mb-2 text-xs uppercase tracking-wide text-mist-500">
        {t('createGroup.inviteCode')}
      </p>
      <button
        onClick={() => copy(group.inviteCode, 'code')}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-court-600 bg-court-800 px-4 py-3 font-mono text-lg text-ball transition-colors hover:border-ball/50"
      >
        {group.inviteCode}
        {copied === 'code' ? <Check size={18} /> : <Copy size={18} />}
      </button>

      <p className="mb-2 text-xs uppercase tracking-wide text-mist-500">
        {t('createGroup.inviteLink')}
      </p>
      <button
        onClick={() => copy(inviteLink, 'link')}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-court-600 bg-court-800 px-4 py-3 text-left text-sm text-mist-300 transition-colors hover:border-ball/50"
      >
        <span className="truncate">{inviteLink}</span>
        {copied === 'link' ? <Check size={18} className="shrink-0" /> : <Copy size={18} className="shrink-0" />}
      </button>
    </Modal>
  );
}
