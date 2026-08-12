import { supabase } from '../lib/supabase';

const TABLE = 'skills';

export async function getSkills() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createSkill(fields) {
  const { data, error } = await supabase
    .from(TABLE).insert(fields).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Create failed — check Supabase RLS policies.');
  return data;
}

export async function updateSkill(id, fields) {
  const { data, error } = await supabase
    .from(TABLE).update(fields).eq('id', id).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Update failed — check Supabase RLS policies.');
  return data;
}

export async function deleteSkill(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function reorderSkills(orderedIds) {
  const updates = orderedIds.map((id, i) =>
    supabase.from(TABLE).update({ sort_order: i }).eq('id', id)
  );
  await Promise.all(updates);
}
