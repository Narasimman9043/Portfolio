import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as svc from '../services/experienceService';

export function useExperience() {
  const [experience, setExperience] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setExperience(await svc.getExperience());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const ch = supabase
      .channel('realtime:experience')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experience' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetch]);

  const create     = useCallback(async (f)        => { const r = await svc.createExperience(f);      await fetch(); return r; }, [fetch]);
  const update     = useCallback(async (id, f)    => { const r = await svc.updateExperience(id, f);  await fetch(); return r; }, [fetch]);
  const remove     = useCallback(async (id)       => { await svc.deleteExperience(id);               await fetch(); }, [fetch]);
  const uploadLogo = useCallback(async (id, file) => { await svc.uploadExpLogo(id, file);            await fetch(); }, [fetch]);

  return { experience, loading, error, refetch: fetch, create, update, remove, uploadLogo };
}
