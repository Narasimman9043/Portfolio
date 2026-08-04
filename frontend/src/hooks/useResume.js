import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as svc from '../services/resumeService';

export function useResume() {
  const [resume,  setResume]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setResume(await svc.getResume());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const ch = supabase
      .channel('realtime:resume')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resume' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetch]);

  const upload = useCallback(async (file) => {
    const r = await svc.uploadResume(file);
    setResume(r);
    return r;
  }, []);

  const remove = useCallback(async () => {
    await svc.deleteResume();
    setResume(null);
  }, []);

  return { resume, loading, error, refetch: fetch, upload, remove };
}
