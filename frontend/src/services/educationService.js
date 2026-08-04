import { supabase } from '../lib/supabase';

const TABLE = 'education';

export async function getEducation() {
  const { data, error } = await supabase
    .from(TABLE).select('*').order('start_year', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createEducation(fields) {
  const { data, error } = await supabase
    .from(TABLE).insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function updateEducation(id, fields) {
  const { data, error } = await supabase
    .from(TABLE).update(fields).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEducation(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
