import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useGroup } from '../contexts/GroupContext';
import { useLocalIdentity } from '../hooks/useLocalIdentity';

export function JoinGroup() {
  const navigate = useNavigate();
  const { code: codeFromUrl } = useParams();
  const { loadGroup, loading, error } = useGroup();
  const { setLastGroupCode } = useLocalIdentity();
  const [code, setCode] = useState(codeFromUrl ?? '');

  const handleJoin = async (value: string) => {
    const group = await loadGroup(value);
    if (group) {
      setLastGroupCode(group.inviteCode);
      navigate(`/g/${group.inviteCode}`);
    }
  };

  useEffect(() => {
    if (codeFromUrl) handleJoin(codeFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-mist-500 transition-colors hover:text-mist-100"
        >
          <ArrowLeft size={16} /> Retour
        </Link>

        <h1 className="mb-2 font-display text-2xl font-bold text-mist-100">Rejoindre un groupe</h1>
        <p className="mb-8 text-sm text-mist-300">
          Colle le code reçu par un ami, par ex. <span className="font-mono text-ball">PADEL-7XQ9M</span>.
        </p>

        <div className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="PADEL-XXXXX"
            className="font-mono"
            autoFocus
          />
          {error && <p className="text-sm text-clay">{error}</p>}
          <Button
            size="lg"
            className="w-full"
            onClick={() => handleJoin(code)}
            disabled={loading || !code.trim()}
          >
            {loading ? 'Recherche…' : 'Rejoindre'}
          </Button>
        </div>
      </div>
    </div>
  );
}
