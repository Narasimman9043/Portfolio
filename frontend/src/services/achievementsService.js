import { supabase } from '../lib/supabase';

const TABLE = 'achievements';

export async function getAchievements() {
  const { data, error } = await supabase
    .from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createAchievement(fields) {
  const { data, error } = await supabase
    .from(TABLE).insert(fields).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Create failed — check Supabase RLS policies.');
  return data;
}

export async function updateAchievement(id, fields) {
  const { data, error } = await supabase
    .from(TABLE).update(fields).eq('id', id).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Update failed — check Supabase RLS policies.');
  return data;
}

export async function deleteAchievement(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
