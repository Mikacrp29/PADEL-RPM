import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { X, Clock, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PadelIcon } from '../components/ui/PadelIcon';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { SocialLinks } from '../components/ui/SocialLinks';
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
        src="/logo-watermark.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90vh] w-[90vh] max-w-none -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.05] sm:h-[140vh] sm:w-[140vh] sm:opacity-[0.07]"
        style={{
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)',
        }}
      />

      {/* Real top bar, in normal document flow — an absolutely positioned
          overlay here used to sit on top of the centered hero title below
          and overlap it on short mobile screens. */}
      <div className="safe-top relative z-20 flex justify-end gap-2 px-6 pt-4 sm:px-6">
        <AccountMenu />
        <LanguageToggle />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-md text-center">
                    <div
            className="relative mx-auto mb-8 w-full overflow-hidden rounded-3xl border border-court-700 bg-court-900 sm:mb-10"
            style={{ aspectRatio: '17 / 10' }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 340 200"
              preserveAspectRatio="none"
              aria-hidden
            >
              <rect
                x="30"
                y="20"
                width="280"
                height="160"
                fill="none"
                stroke="#c8f13c"
                strokeOpacity="0.35"
                strokeWidth="1.5"
              />
              <line x1="170" y1="20" x2="170" y2="180" stroke="#c8f13c" strokeOpacity="0.3" strokeWidth="1.5" />
              <line x1="90" y1="20" x2="90" y2="180" stroke="#c8f13c" strokeOpacity="0.2" strokeWidth="1" />
              <line x1="250" y1="20" x2="250" y2="180" stroke="#c8f13c" strokeOpacity="0.2" strokeWidth="1" />
              <line x1="90" y1="100" x2="250" y2="100" stroke="#c8f13c" strokeOpacity="0.2" strokeWidth="1" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/logo.webp"
                alt="Padel Ensemble"
                className="h-32 w-32 rounded-2xl sm:h-40 sm:w-40"
                style={{ filter: 'drop-shadow(0 0 28px rgba(200,241,60,0.4))' }}
              />
            </div>
          </div>
          <h1 className="sr-only">Padel Ensemble</h1>
          <p className="mx-auto mb-10 max-w-[19rem] text-base leading-relaxed text-mist-200 sm:max-w-xs sm:text-lg">
            {t('home.subtitle')}
          </p>

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
                            <div className="flex flex-col items-center gap-3 py-2 text-mist-500">
                <PadelIcon size={36} className="text-court-600" />
                <p className="text-center text-sm">{t('home.noFavorites')}</p>
              </div>
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

                    <SocialLinks className="mt-10" />

          <button
            onClick={() => navigate('/tutoriel')}
            className="mx-auto mt-6 flex items-center gap-1.5 text-sm text-mist-400 underline decoration-dotted underline-offset-4 transition-colors hover:text-ball"
          >
            <ImageIcon size={14} />
            {t('home.viewTutorial')}
          </button>
        </div>
      </div>
    </div>
  );
}
