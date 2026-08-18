import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { CalendarPreview } from '../components/ui/CalendarPreview';
import { AccountMenu } from '../components/auth/AccountMenu';
import { useFavoriteGroups } from '../hooks/useFavoriteGroups';
import { useLanguage } from '../contexts/LanguageContext';

export function Home() {
  const navigate = useNavigate();
  const { groups, removeGroup } = useFavoriteGroups();
  const { t } = useLanguage();

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

      <div className="safe-top-corner absolute right-4 z-20 flex items-center gap-2 sm:right-6">
        <AccountMenu />
        <LanguageToggle />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <h1 className="mb-3 font-display text-4xl font-bold leading-tight text-mist-100 sm:text-5xl">
          Padel <span className="text-ball">Ensemble</span>
        </h1>
        <p className="mb-10 text-mist-300">{t('home.subtitle')}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={() => navigate('/create')}>
            {t('home.createGroup')}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1"
            onClick={() => navigate('/join')}
          >
            {t('home.joinGroup')}
          </Button>
        </div>

        <div className="mt-10 text-left">
          {groups.length === 0 ? (
            <p className="text-center text-sm text-mist-500">{t('home.noFavorites')}</p>
          ) : (
            <>
              <p className="mb-3 text-center text-sm font-medium text-mist-300">
                {t('home.myGroups')}
              </p>
              <ul className="space-y-2 animate-fade-up">
                {groups.map((g) => (
                  <li
                    key={g.code}
                    className="flex items-center gap-2 rounded-xl border border-court-600 bg-court-800 px-4 py-3"
                  >
                    <button
                      onClick={() => navigate(`/g/${g.code}`)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span className="shrink-0 text-ball">⭐</span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-mist-100">
                          {g.name}
                        </span>
                        <span className="font-mono text-xs text-mist-500">{g.code}</span>
                      </span>
                    </button>
                    <button
                      onClick={() => removeGroup(g.code)}
                      aria-label={t('home.removeFavorite')}
                      className="shrink-0 rounded-lg p-1.5 text-mist-500 transition-colors hover:bg-court-700 hover:text-clay"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <CalendarPreview />
      </div>
    </div>
  );
}