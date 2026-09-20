import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useConsent } from '../contexts/ConsentContext';

export function CookiesPolicy() {
  const { t } = useLanguage();
  const { openBanner } = useConsent();

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-mist-400 hover:text-mist-100"
        >
          <ArrowLeft size={16} />
          Padel Ensemble
        </Link>

        <h1 className="mb-4 font-display text-2xl font-bold text-mist-100">
          {t('cookies.policyTitle')}
        </h1>

        <div className="rounded-xl border border-clay/40 bg-clay/10 p-4 text-sm text-mist-300">
          {t('cookies.policyPlaceholder')}
        </div>

        <button
          onClick={openBanner}
          className="mt-6 rounded-xl bg-ball px-4 py-2.5 text-sm font-semibold text-court-950 hover:bg-ball-dim"
        >
          {t('cookies.manage')}
        </button>
      </div>
    </div>
  );
}