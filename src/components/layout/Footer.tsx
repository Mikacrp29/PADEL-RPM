import { Link } from 'react-router-dom';
import { useConsent } from '../../contexts/ConsentContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function Footer() {
  const { openBanner } = useConsent();
  const { t } = useLanguage();

  return (
    <footer className="relative mt-auto border-t border-court-700 px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 text-xs text-mist-500">
        <span>© {new Date().getFullYear()} Padel Ensemble · {t('footer.rights')}</span>
        <div className="flex items-center gap-4">
          <Link to="/cookies" className="hover:text-mist-100">
            {t('cookies.policyLink')}
          </Link>
          <button onClick={openBanner} className="hover:text-mist-100">
            {t('cookies.manage')}
          </button>
        </div>
      </div>
    </footer>
  );
}