import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Users, Calendar, CalendarDays, ShieldAlert } from 'lucide-react';
import { functions } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';
import { Button } from '../components/ui/Button';
import { MiniBarChart } from '../components/admin/MiniBarChart';

const ADMIN_EMAIL = 'mikacrupi@gmail.com';

interface WeekBucket {
  weekStart: string;
  groups: number;
  accounts: number;
  slots: number;
}

interface AdminStats {
  groupCount: number;
  accountCount: number;
  slotCount: number;
  weeklySeries: WeekBucket[];
}

export function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isAdmin = user?.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    document.title = 'Admin · Padel Ensemble';
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingStats(true);
    setError(null);
    const getAdminStats = httpsCallable<void, AdminStats>(functions, 'getAdminStats');
    getAdminStats()
      .then((result) => setStats(result.data))
      .catch((err) => {
        const code = (err as { code?: string })?.code ?? 'unknown';
        setError(`Impossible de charger les statistiques (${code}). Réessaie.`);
      })
      .finally(() => setLoadingStats(false));
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-mist-300">
        Chargement…
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldAlert size={32} className="text-clay" />
        <p className="text-mist-300">Cette page est réservée à l'administrateur.</p>

        {!user ? (
          <>
            <Button onClick={() => setAuthModalOpen(true)}>Se connecter</Button>
            <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
          </>
        ) : (
          <>
            <p className="text-xs text-mist-500">
              Connecté en tant que <span className="text-mist-300">{user.email}</span> —
              ce compte n'est pas autorisé.
            </p>
            <Button variant="secondary" onClick={() => signOut()}>
              Se déconnecter pour changer de compte
            </Button>
          </>
        )}
      </div>
    );
  }

  const cards = [
    { icon: Users, label: 'Comptes créés', value: stats?.accountCount },
    { icon: Calendar, label: 'Groupes créés', value: stats?.groupCount },
    { icon: CalendarDays, label: 'Créneaux créés (total)', value: stats?.slotCount },
  ];

  const series = stats?.weeklySeries ?? [];

  return (
    <div className="min-h-screen bg-court-950 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-display text-2xl font-bold text-mist-100">
          Statistiques du site
        </h1>

        {error && <p className="mb-4 text-sm text-clay">{error}</p>}

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-court-700 bg-court-900 p-6">
              <Icon size={20} className="mb-3 text-ball" />
              <p className="font-display text-3xl font-bold text-mist-100">
                {loadingStats ? '…' : (value ?? '—')}
              </p>
              <p className="mt-1 text-sm text-mist-500">{label}</p>
            </div>
          ))}
        </div>

        {series.length > 0 && (
          <>
            <h2 className="mb-1 font-display text-lg font-semibold text-mist-100">
              Activité des 12 dernières semaines
            </h2>
            <p className="mb-4 text-xs text-mist-500">
              Chaque barre = le nombre créé <span className="text-mist-300">cette semaine-là</span>{' '}
              précisément (pas un total cumulé) — une barre à zéro veut dire aucune activité
              cette semaine-là. Passe la souris sur une barre pour voir le détail.
            </p>
            <div className="space-y-4">
              <MiniBarChart
                label="Comptes créés / semaine"
                color="#c8f13c"
                data={series.map((w) => ({ weekStart: w.weekStart, value: w.accounts }))}
              />
              <MiniBarChart
                label="Groupes créés / semaine"
                color="#3d7ac9"
                data={series.map((w) => ({ weekStart: w.weekStart, value: w.groups }))}
              />
              <MiniBarChart
                label="Créneaux créés / semaine"
                color="#4fbf6b"
                data={series.map((w) => ({ weekStart: w.weekStart, value: w.slots }))}
              />
            </div>
          </>
        )}

        <p className="mt-8 text-xs text-mist-600">
          "Créneaux créés (total)" compte tous les créneaux jamais créés dans tous les
          groupes, y compris ceux passés depuis plus de 60 jours (non visibles dans les
          calendriers, mais toujours comptés ici).
        </p>
      </div>
    </div>
  );
}