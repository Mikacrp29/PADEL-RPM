import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Copy, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { createGroup } from '../firebase/groups';
import { useLocalIdentity } from '../hooks/useLocalIdentity';
import { useLanguage } from '../contexts/LanguageContext';
import type { Group } from '../types';

export function CreateGroup() {
  const navigate = useNavigate();
  const { setNickname, setLastGroupCode } = useLocalIdentity();
  const { t } = useLanguage();
  const [groupName, setGroupName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const inviteLink = createdGroup
    ? `${window.location.origin}/join/${createdGroup.inviteCode}`
    : '';

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError(t('createGroup.errorNoName'));
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const group = await createGroup(groupName, creatorName);
      setCreatedGroup(group);
      if (creatorName.trim()) setNickname(creatorName.trim());
      setLastGroupCode(group.inviteCode);
    } catch {
      setError(t('createGroup.errorFailed'));
    } finally {
      setCreating(false);
    }
  };

  const copy = async (value: string, kind: 'code' | 'link') => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  if (createdGroup) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <LanguageToggle />
        </div>
        <div className="w-full max-w-md animate-fade-up rounded-2xl border border-court-600 bg-court-900 p-8 text-center">
          <p className="mb-1 text-sm text-mist-300">{t('createGroup.created')}</p>
          <h1 className="mb-6 font-display text-2xl font-bold text-mist-100">
            {createdGroup.name}
          </h1>

          <p className="mb-2 text-xs uppercase tracking-wide text-mist-500">
            {t('createGroup.inviteCode')}
          </p>
          <button
            onClick={() => copy(createdGroup.inviteCode, 'code')}
            className="mb-4 flex w-full items-center justify-between rounded-xl border border-court-600 bg-court-800 px-4 py-3 font-mono text-lg text-ball transition-colors hover:border-ball/50"
          >
            {createdGroup.inviteCode}
            {copied === 'code' ? <Check size={18} /> : <Copy size={18} />}
          </button>

          <p className="mb-2 text-xs uppercase tracking-wide text-mist-500">
            {t('createGroup.inviteLink')}
          </p>
          <button
            onClick={() => copy(inviteLink, 'link')}
            className="mb-6 flex w-full items-center justify-between gap-2 rounded-xl border border-court-600 bg-court-800 px-4 py-3 text-left text-sm text-mist-300 transition-colors hover:border-ball/50"
          >
            <span className="truncate">{inviteLink}</span>
            {copied === 'link' ? <Check size={18} className="shrink-0" /> : <Copy size={18} className="shrink-0" />}
          </button>

          <Button size="lg" className="w-full" onClick={() => navigate(`/g/${createdGroup.inviteCode}`)}>
            {t('createGroup.openCalendar')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-mist-500 transition-colors hover:text-mist-100"
        >
          <ArrowLeft size={16} /> {t('createGroup.back')}
        </Link>

        <h1 className="mb-2 font-display text-2xl font-bold text-mist-100">
          {t('createGroup.title')}
        </h1>
        <p className="mb-8 text-sm text-mist-300">{t('createGroup.subtitle')}</p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-mist-300">
              {t('createGroup.groupName')}
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t('createGroup.groupNamePlaceholder')}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-mist-300">
              {t('createGroup.yourName')}
            </label>
            <Input
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder={t('createGroup.yourNamePlaceholder')}
            />
          </div>
          {error && <p className="text-sm text-clay">{error}</p>}
          <Button size="lg" className="w-full" onClick={handleCreate} disabled={creating}>
            {creating ? t('createGroup.creating') : t('createGroup.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
}
