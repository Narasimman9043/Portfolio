import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as svc from '../services/certificatesService';

export function useCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setCertificates(await svc.getCertificates());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const ch = supabase
      .channel('realtime:certificates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetch]);

  const create      = useCallback(async (f)        => { const r = await svc.createCertificate(f);     await fetch(); return r; }, [fetch]);
  const update      = useCallback(async (id, f)    => { const r = await svc.updateCertificate(id, f); await fetch(); return r; }, [fetch]);
  const remove      = useCallback(async (id)       => { await svc.deleteCertificate(id);              await fetch(); }, [fetch]);
  const uploadImage = useCallback(async (id, file) => { await svc.uploadCertImage(id, file);          await fetch(); }, [fetch]);

  return { certificates, loading, error, refetch: fetch, create, update, remove, uploadImage };
}
