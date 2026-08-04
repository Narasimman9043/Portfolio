import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as svc from '../services/skillsService';

export function useSkills() {
  const [skills,  setSkills]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setSkills(await svc.getSkills());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const ch = supabase
      .channel('realtime:skills')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetch]);

  const create  = useCallback(async (f) => { await svc.createSkill(f);         await fetch(); }, [fetch]);
  const update  = useCallback(async (id, f) => { await svc.updateSkill(id, f); await fetch(); }, [fetch]);
  const remove  = useCallback(async (id) => { await svc.deleteSkill(id);       await fetch(); }, [fetch]);
  const reorder = useCallback(async (ids) => { await svc.reorderSkills(ids);   await fetch(); }, [fetch]);

  return { skills, loading, error, refetch: fetch, create, update, remove, reorder };
}
