import { SLOT_STATUS_COLOR, SLOT_STATUS_LABEL_KEY } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface ExampleSlot {
  day: string;
  dayEn: string;
  time: string;
  names: string[];
  status: 'low' | 'mid' | 'ready';
}

const EXAMPLES: ExampleSlot[] = [
  { day: 'Mardi', dayEn: 'Tuesday', time: '19:00 – 20:30', names: ['Léo', 'Sam'], status: 'low' },
  { day: 'Jeudi', dayEn: 'Thursday', time: '20:00 – 21:30', names: ['Nina', 'Tom', 'Ana'], status: 'mid' },
  {
    day: 'Samedi',
    dayEn: 'Saturday',
    time: '10:00 – 11:30',
    names: ['Léo', 'Sam', 'Nina', 'Tom'],
    status: 'ready',
  },
];

export function CalendarPreview() {
  const { t, language } = useLanguage();

  return (
    <div className="mt-10 text-left">
      <p className="mb-1 text-center text-sm font-medium text-mist-300">
        {t('home.previewTitle')}
      </p>
      <p className="mb-4 text-center text-xs text-mist-500">{t('home.previewSubtitle')}</p>

      <ul className="space-y-2">
        {EXAMPLES.map((slot) => (
          <li
            key={slot.day}
            className="flex items-center gap-3 rounded-xl border border-court-600 bg-court-800/60 px-4 py-3"
            style={{ borderLeftColor: SLOT_STATUS_COLOR[slot.status], borderLeftWidth: 3 }}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-mist-100">
                {language === 'en' ? slot.dayEn : slot.day} · {slot.time}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-mist-500">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: SLOT_STATUS_COLOR[slot.status] }}
                />
                {t(SLOT_STATUS_LABEL_KEY[slot.status])}
              </span>
            </div>
            <div className="flex -space-x-2">
              {slot.names.map((name) => (
                <span
                  key={name}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-court-800 bg-ball/20 text-xs font-semibold text-ball"
                >
                  {name.charAt(0)}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}