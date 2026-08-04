import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as svc from '../services/achievementsService';

export function useAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setAchievements(await svc.getAchievements());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const ch = supabase
      .channel('realtime:achievements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetch]);

  const create = useCallback(async (f)     => { await svc.createAchievement(f);       await fetch(); }, [fetch]);
  const update = useCallback(async (id, f) => { await svc.updateAchievement(id, f);   await fetch(); }, [fetch]);
  const remove = useCallback(async (id)    => { await svc.deleteAchievement(id);       await fetch(); }, [fetch]);

  return { achievements, loading, error, refetch: fetch, create, update, remove };
}
