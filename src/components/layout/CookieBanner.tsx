import { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConsent } from '../../contexts/ConsentContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function CookieBanner() {
  const { consent, bannerOpen, closeBanner, setConsent } = useConsent();
  const { t } = useLanguage();
  const [customizing, setCustomizing] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(consent?.analytics ?? false);

  if (!bannerOpen) return null;

  const canDismiss = consent !== null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex justify-center px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="w-full max-w-2xl rounded-2xl border border-court-600 bg-court-900 p-4 shadow-[0_24px_60px_-12px_rgba(7,26,26,0.75)] sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="font-display text-sm font-semibold text-mist-100">
            {t('cookies.bannerTitle')}
          </h2>
          {canDismiss && (
            <button
              onClick={closeBanner}
              aria-label={t('cookies.close')}
              className="shrink-0 text-mist-500 hover:text-mist-100"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <p className="mb-4 text-sm leading-relaxed text-mist-300">
          {t('cookies.bannerText')}{' '}
          <Link to="/cookies" className="text-ball underline underline-offset-4">
            {t('cookies.readMore')}
          </Link>
        </p>

        {customizing && (
          <div className="mb-4 space-y-3 rounded-xl border border-court-700 bg-court-800 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-mist-100">{t('cookies.necessaryTitle')}</p>
                <p className="text-xs text-mist-500">{t('cookies.necessaryDesc')}</p>
              </div>
              <div className="h-6 w-11 shrink-0 rounded-full bg-ball/40 p-0.5">
                <div className="h-5 w-5 translate-x-5 rounded-full bg-ball" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-mist-100">{t('cookies.analyticsTitle')}</p>
                <p className="text-xs text-mist-500">{t('cookies.analyticsDesc')}</p>
              </div>
              <button
                role="switch"
                aria-checked={analyticsChoice}
                onClick={() => setAnalyticsChoice((v) => !v)}
                className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${
                  analyticsChoice ? 'bg-ball/40' : 'bg-court-700'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-ball transition-transform ${
                    analyticsChoice ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {!customizing ? (
            <>
              <button
                onClick={() => setConsent(false)}
                className="flex-1 rounded-xl border border-court-600 px-4 py-2.5 text-sm font-semibold text-mist-100 transition-colors hover:bg-court-800"
              >
                {t('cookies.refuse')}
              </button>
              <button
                onClick={() => setCustomizing(true)}
                className="flex-1 rounded-xl border border-court-600 px-4 py-2.5 text-sm font-medium text-mist-300 transition-colors hover:bg-court-800"
              >
                {t('cookies.customize')}
              </button>
              <button
                onClick={() => setConsent(true)}
                className="flex-1 rounded-xl bg-ball px-4 py-2.5 text-sm font-semibold text-court-950 transition-colors hover:bg-ball-dim"
              >
                {t('cookies.accept')}
              </button>
            </>
          ) : (
            <button
              onClick={() => setConsent(analyticsChoice)}
              className="w-full rounded-xl bg-ball px-4 py-2.5 text-sm font-semibold text-court-950 transition-colors hover:bg-ball-dim"
            >
              {t('cookies.confirmChoices')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}