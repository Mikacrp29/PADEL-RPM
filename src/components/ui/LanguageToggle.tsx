import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { t, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Switch language"
      className={`flex items-center gap-1.5 rounded-lg border border-court-600 px-2.5 py-1.5 text-xs font-medium text-mist-300 transition-colors hover:border-ball/50 hover:text-mist-100 ${className}`}
    >
      <Languages size={14} />
      {t('lang.switchTo')}
    </button>
  );
}
