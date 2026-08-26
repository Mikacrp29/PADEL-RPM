import { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AuthModal } from './AuthModal';

export function AccountMenu({ className = '' }: { className?: string }) {
  const { user, profile, signOut, setNickname, setNotifyByEmail } = useAuth();
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the panel on an outside click, in addition to the explicit
  // "Done" button — without this, it stayed open until the person noticed
  // the small button, which was easy to miss.
  useEffect(() => {
    if (!panelOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen]);

  if (!user) {
    return (
      <>
        <Button
          size="sm"
          variant="secondary"
          className={className}
          onClick={() => setModalOpen(true)}
        >
          <UserIcon size={14} />
          {t('auth.signIn')}
        </Button>
        <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  const initial = (profile?.nickname || user.email || '?').charAt(0).toUpperCase();

  return (
    <div ref={panelRef} className={`relative ${className}`}>
      <button
        onClick={() => {
          setNicknameDraft(profile?.nickname ?? '');
          setPanelOpen((v) => !v);
        }}
        className="flex items-center gap-2 rounded-lg bg-court-800 px-3 py-1.5 text-xs font-medium text-mist-100 transition-colors hover:bg-court-700"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="h-5 w-5 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ball/20 text-[10px] font-semibold text-ball">
            {initial}
          </span>
        )}
        {profile?.nickname || user.email}
      </button>

      {panelOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 animate-pop rounded-xl border border-court-600 bg-court-900 p-4 shadow-[0_24px_60px_-12px_rgba(7,26,26,0.65)]">
          <p className="mb-1 text-xs text-mist-500">{t('auth.nickname')}</p>
          <Input
            value={nicknameDraft}
            onChange={(e) => setNicknameDraft(e.target.value)}
            onBlur={() => {
              if (nicknameDraft.trim() && nicknameDraft.trim() !== profile?.nickname) {
                setNickname(nicknameDraft.trim());
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="mb-4"
          />

          <label className="mb-4 flex cursor-pointer items-start gap-2.5 text-sm text-mist-100">
            <input
              type="checkbox"
              checked={profile?.notifyByEmail ?? false}
              onChange={(e) => setNotifyByEmail(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-ball"
            />
            <span className="flex items-start gap-1.5">
              <Mail size={14} className="mt-0.5 shrink-0 text-mist-500" />
              {t('auth.notifyByEmail')}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-clay hover:bg-clay/10"
              onClick={async () => {
                await signOut();
                setPanelOpen(false);
              }}
            >
              <LogOut size={14} />
              {t('auth.signOut')}
            </Button>
            <Button size="sm" className="flex-1" onClick={() => setPanelOpen(false)}>
              {t('common.done')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
