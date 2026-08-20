import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { CalendarPreview } from '../components/ui/CalendarPreview';
import { AccountMenu } from '../components/auth/AccountMenu';
import { useFavoriteGroups } from '../hooks/useFavoriteGroups';
import { useRecentGroups } from '../hooks/useRecentGroups';
import { useLanguage } from '../contexts/LanguageContext';

export function Home() {
  const navigate = useNavigate();
  const { groups, removeGroup, isFavorite } = useFavoriteGroups();
  const { recents } = useRecentGroups();
  const { t } = useLanguage();

  useEffect(() => {
    document.title = 'Padel Ensemble';
  }, []);

  // Don't repeat a group in "recently viewed" if it's already pinned above
  // as a favorite — no need to show the same group twice on the page.
  const recentsToShow = recents.filter((r) => !isFavorite(r.code));

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="court-lines pointer-events-none absolute inset-0" />
      <img
        src="/logo-watermark.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[140vh] w-[140vh] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
      />

      {/* Real top bar, in normal document flow — an absolutely positioned
          overlay here used to sit on top of the centered hero title below
          and overlap it on short mobile screens. */}
      <div className="safe-top relative z-20 flex justify-end gap-2 px-6 pt-4 sm:px-6">
        <AccountMenu />
        <LanguageToggle />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md text-center">
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

          {recentsToShow.length > 0 && (
            <div className="mt-6 text-left">
              <p className="mb-3 flex items-center justify-center gap-1.5 text-center text-sm font-medium text-mist-300">
                <Clock size={14} className="text-mist-500" />
                {t('home.recentGroups')}
              </p>
              <ul className="space-y-2">
                {recentsToShow.map((g) => (
                  <li key={g.code}>
                    <button
                      onClick={() => navigate(`/g/${g.code}`)}
                      className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-court-700 bg-court-800/40 px-4 py-3 text-left transition-colors hover:border-court-600"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-mist-100">
                          {g.name}
                        </span>
                        <span className="font-mono text-xs text-mist-500">{g.code}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CalendarPreview />
        </div>
      </div>
    </div>
  );
}
