import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultNickname?: string;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.85.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

export function AuthModal({ open, onClose, defaultNickname = '' }: AuthModalProps) {
  const { t } = useLanguage();
  const { signInGoogle, signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(defaultNickname);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const close = () => {
    setError(null);
    setResetMessage(null);
    onClose();
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInGoogle();
      close();
    } catch {
      setError(t('auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError(t('auth.errorGeneric'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signUp(email, password, nickname);
      } else {
        await signIn(email, password);
      }
      close();
    } catch {
      setError(t('auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError(t('auth.errorGeneric'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword(email);
      setResetMessage(t('auth.resetSent'));
    } catch {
      setError(t('auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={mode === 'signup' ? t('auth.titleSignUp') : t('auth.titleSignIn')}
    >
      <p className="mb-5 text-sm text-mist-300">{t('auth.accountBenefits')}</p>

      <Button
        variant="secondary"
        size="lg"
        className="mb-4 w-full gap-2.5"
        onClick={handleGoogle}
        disabled={submitting}
      >
        <GoogleIcon />
        {t('auth.continueWithGoogle')}
      </Button>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-court-600" />
        <span className="text-xs text-mist-500">{t('auth.or')}</span>
        <div className="h-px flex-1 bg-court-600" />
      </div>

      <div className="space-y-3">
        {mode === 'signup' && (
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t('auth.nickname')}
          />
        )}
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.email')}
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.password')}
        />

        {error && <p className="text-sm text-clay">{error}</p>}
        {resetMessage && <p className="text-sm text-slot-ready">{resetMessage}</p>}

        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting
            ? t('auth.submitting')
            : mode === 'signup'
              ? t('auth.submitSignUp')
              : t('auth.submitSignIn')}
        </Button>

        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError(null);
              setResetMessage(null);
            }}
            className="text-mist-400 underline decoration-dotted underline-offset-4 hover:text-mist-100"
          >
            {mode === 'signup' ? t('auth.haveAccount') : t('auth.noAccount')}
          </button>
          {mode === 'signin' && (
            <button
              onClick={handleReset}
              className="text-mist-400 underline decoration-dotted underline-offset-4 hover:text-mist-100"
            >
              {t('auth.forgotPassword')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
