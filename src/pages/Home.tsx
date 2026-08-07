import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { useLocalIdentity } from '../hooks/useLocalIdentity';

export function Home() {
  const navigate = useNavigate();
  const { lastGroupCode } = useLocalIdentity();

  useEffect(() => {
    document.title = 'Padel Ensemble';
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="court-lines pointer-events-none absolute inset-0" />
      <img
        src="/logo-watermark.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[140vh] w-[140vh] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
      />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-court-600 bg-court-800/60 px-3 py-1 text-xs font-medium text-mist-300">
          <span className="h-1.5 w-1.5 rounded-full bg-ball" />
          Sans compte, sans mot de passe
        </div>

        <h1 className="mb-3 font-display text-4xl font-bold leading-tight text-mist-100 sm:text-5xl">
          Padel <span className="text-ball">Ensemble</span>
        </h1>
        <p className="mb-10 text-mist-300">
          Un calendrier partagé pour organiser vos parties entre amis. Créez un groupe,
          partagez le lien, jouez.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={() => navigate('/create')}>
            Créer un groupe
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1"
            onClick={() => navigate('/join')}
          >
            Rejoindre un groupe
          </Button>
        </div>

        {lastGroupCode && (
          <button
            onClick={() => navigate(`/join/${lastGroupCode}`)}
            className="mt-6 text-sm text-mist-500 underline decoration-dotted underline-offset-4 transition-colors hover:text-ball"
          >
            Retourner à mon dernier groupe ({lastGroupCode})
          </button>
        )}
      </div>
    </div>
  );
}
