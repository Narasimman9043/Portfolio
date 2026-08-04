import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as svc from '../services/educationService';

export function useEducation() {
  const [education, setEducation] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setEducation(await svc.getEducation());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const ch = supabase
      .channel('realtime:education')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'education' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetch]);

  const create = useCallback(async (f)     => { await svc.createEducation(f);       await fetch(); }, [fetch]);
  const update = useCallback(async (id, f) => { await svc.updateEducation(id, f);   await fetch(); }, [fetch]);
  const remove = useCallback(async (id)    => { await svc.deleteEducation(id);       await fetch(); }, [fetch]);

  return { education, loading, error, refetch: fetch, create, update, remove };
}
