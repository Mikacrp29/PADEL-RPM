import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const STEP_COUNT = 9;

export function Tutorial() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = 'Tutoriel · Padel Ensemble';
  }, []);

  return (
    <div className="min-h-screen bg-court-950 pb-16">
      <div className="safe-top sticky top-0 z-20 border-b border-court-700 bg-court-950/90 px-6 py-4 backdrop-blur">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-mist-300 transition-colors hover:text-mist-100"
        >
          <ArrowLeft size={16} /> {t('createGroup.back')}
        </Link>
      </div>

      <div className="mx-auto max-w-xl px-4 pt-6">
        <h1 className="mb-8 text-center font-display text-2xl font-bold text-mist-100">
          {t('tutorial.title')}
        </h1>

        <div className="space-y-6">
          {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((step) => (
            <img
              key={step}
              src={`/tutorial/step-${step}.jpg`}
              alt={`${t('tutorial.title')} ${step}/${STEP_COUNT}`}
              className="w-full rounded-2xl border border-court-700"
              loading={step <= 2 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
