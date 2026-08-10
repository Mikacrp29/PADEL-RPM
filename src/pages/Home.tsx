import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Users, X, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useFavoriteGroups } from '../hooks/useFavoriteGroups';

export function Home() {
  const navigate = useNavigate();
  const { groups, removeGroup } = useFavoriteGroups();
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    document.title = 'Padel Ensemble';
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
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

        {groups.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowFavorites((v) => !v)}
              className="mx-auto flex items-center gap-2 rounded-full border border-court-600 bg-court-800/60 px-4 py-2 text-sm font-medium text-mist-100 transition-colors hover:border-ball/50"
            >
              <Users size={16} className="text-ball" />
              Mes groupes favoris ({groups.length})
              <ChevronDown
                size={16}
                className={`text-mist-500 transition-transform ${showFavorites ? 'rotate-180' : ''}`}
              />
            </button>

            {showFavorites && (
              <ul className="mt-4 space-y-2 text-left animate-fade-up">
                {groups.map((g) => (
                  <li
                    key={g.code}
                    className="flex items-center gap-2 rounded-xl border border-court-600 bg-court-800 px-4 py-3"
                  >
                    <button
                      onClick={() => navigate(`/g/${g.code}`)}
                      className="flex min-w-0 flex-1 flex-col text-left"
                    >
                      <span className="truncate text-sm font-medium text-mist-100">
                        {g.name}
                      </span>
                      <span className="font-mono text-xs text-mist-500">{g.code}</span>
                    </button>
                    <button
                      onClick={() => removeGroup(g.code)}
                      aria-label="Retirer des favoris"
                      className="shrink-0 rounded-lg p-1.5 text-mist-500 transition-colors hover:bg-court-700 hover:text-clay"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
