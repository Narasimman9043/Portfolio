import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as svc from '../services/projectService';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setProjects(await svc.getProjects());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const ch = supabase
      .channel('realtime:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetch]);

  const create      = useCallback(async (f)     => { const r = await svc.createProject(f);       await fetch(); return r; }, [fetch]);
  const update      = useCallback(async (id, f) => { const r = await svc.updateProject(id, f);   await fetch(); return r; }, [fetch]);
  const remove      = useCallback(async (id)    => { await svc.deleteProject(id);                await fetch(); }, [fetch]);
  const uploadImage = useCallback(async (id, file) => { await svc.uploadProjectImage(id, file);  await fetch(); }, [fetch]);

  return { projects, loading, error, refetch: fetch, create, update, remove, uploadImage };
}
