import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Users, Star } from 'lucide-react';
import { useFavoriteGroups } from '../../hooks/useFavoriteGroups';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageToggle } from '../ui/LanguageToggle';
import { AccountMenu } from '../auth/AccountMenu';
import type { Group } from '../../types';

interface NavbarProps {
  group: Group;
  nickname: string;
  onNicknameChange: (value: string) => void;
}

export function Navbar({ group, nickname, onNicknameChange }: NavbarProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nickname);
  const { isFavorite, addGroup, removeGroup } = useFavoriteGroups();
  const { t } = useLanguage();

  const favorite = isFavorite(group.inviteCode);
  const inviteLink = `${window.location.origin}/join/${group.inviteCode}`;

  const copy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleFavorite = () => {
    if (favorite) removeGroup(group.inviteCode);
    else addGroup(group.inviteCode, group.name);
  };

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-court-700 bg-court-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-sm font-bold text-mist-100">
          <img src="/logo.png" alt="" className="h-7 w-7 rounded-md" />
          Padel <span className="text-ball">Ensemble</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-2 sm:flex">
          <button
            onClick={toggleFavorite}
            aria-label={favorite ? t('navbar.removeFavorite') : t('navbar.addFavorite')}
            className="shrink-0 rounded-lg p-1.5 text-mist-500 transition-colors hover:bg-court-800 hover:text-ball"
          >
            <Star size={16} className={favorite ? 'fill-ball text-ball' : ''} />
          </button>
          <span className="truncate text-sm font-medium text-mist-100">{group.name}</span>
          <span className="rounded-full bg-court-800 px-2 py-0.5 font-mono text-xs text-mist-300">
            {group.inviteCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            aria-label={favorite ? t('navbar.removeFavorite') : t('navbar.addFavorite')}
            className="rounded-lg p-1.5 text-mist-500 transition-colors hover:bg-court-800 hover:text-ball sm:hidden"
          >
            <Star size={16} className={favorite ? 'fill-ball text-ball' : ''} />
          </button>

          <AccountMenu className="hidden sm:block" />
          <LanguageToggle className="hidden sm:flex" />

          <button
            onClick={copy}
            className="hidden items-center gap-1.5 rounded-lg border border-court-600 px-3 py-1.5 text-xs text-mist-300 transition-colors hover:border-ball/50 hover:text-mist-100 sm:flex"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {t('navbar.invite')}
          </button>

          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                onNicknameChange(draft.trim() || nickname);
                setEditing(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="w-28 rounded-lg border border-ball/60 bg-court-800 px-2.5 py-1.5 text-xs text-mist-100 outline-none"
            />
          ) : (
            <button
              onClick={() => {
                setDraft(nickname);
                setEditing(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-court-800 px-3 py-1.5 text-xs font-medium text-mist-100 transition-colors hover:bg-court-700"
            >
              <Users size={14} className="text-ball" />
              {nickname || t('navbar.anonymous')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
