import { useMemo } from 'react';
import { CalendarDays, Trophy, Clock, Users } from 'lucide-react';
import type { Slot } from '../../types';
import { getSlotStatus } from '../../types';

interface DashboardProps {
  slots: Slot[];
  memberCount: number;
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function Dashboard({ slots, memberCount }: DashboardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const thisWeek = slots.filter((s) => {
      const d = s.start.toDate();
      return d >= weekStart && d < weekEnd;
    });

    const validated = slots.filter((s) => getSlotStatus(s.participants.length) === 'ready');

    const upcoming = slots
      .filter((s) => s.start.toDate() > now)
      .sort((a, b) => a.start.toMillis() - b.start.toMillis())[0];

    return { thisWeekCount: thisWeek.length, validatedCount: validated.length, upcoming };
  }, [slots]);

  const cards = [
    {
      icon: CalendarDays,
      label: 'Créneaux cette semaine',
      value: stats.thisWeekCount,
    },
    {
      icon: Trophy,
      label: 'Matchs validés',
      value: stats.validatedCount,
    },
    {
      icon: Clock,
      label: 'Prochain match',
      value: stats.upcoming
        ? stats.upcoming.start.toDate().toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })
        : '—',
    },
    {
      icon: Users,
      label: 'Joueurs du groupe',
      value: memberCount,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="rounded-2xl border border-court-700 bg-court-900 p-4 transition-colors hover:border-court-600"
        >
          <Icon size={18} className="mb-3 text-ball" />
          <p className="font-display text-xl font-semibold text-mist-100">{value}</p>
          <p className="text-xs text-mist-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
