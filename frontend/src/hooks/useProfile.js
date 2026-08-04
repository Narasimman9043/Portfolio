import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as svc from '../services/profileService';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      const data = await svc.getProfile();
      setProfile(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime — subscribe to users table changes
  useEffect(() => {
    const channel = supabase
      .channel('realtime:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          if (payload.eventType === 'UPDATE') setProfile(payload.new);
          if (payload.eventType === 'DELETE') setProfile(null);
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const update = useCallback(async (fields) => {
    if (!profile?.id) return;
    const updated = await svc.updateProfile(profile.id, fields);
    setProfile(updated);
    return updated;
  }, [profile]);

  const uploadPhoto = useCallback(async (file) => {
    if (!profile?.id) return;
    const updated = await svc.uploadProfilePhoto(profile.id, file);
    setProfile(updated);
    return updated;
  }, [profile]);

  return { profile, loading, error, refetch: fetch, update, uploadPhoto };
}
