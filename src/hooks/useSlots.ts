import { useEffect, useState } from 'react';
import { subscribeToSlots } from '../firebase/slots';
import type { Slot } from '../types';

export function useSlots(groupId: string | null) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setSlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToSlots(groupId, (next) => {
      setSlots(next);
      setLoading(false);
    });
    return unsubscribe;
  }, [groupId]);

  return { slots, loading };
}
