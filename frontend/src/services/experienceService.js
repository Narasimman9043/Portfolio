import { supabase } from '../lib/supabase';

const TABLE  = 'experience';
const BUCKET = 'portfolio-images';

export async function getExperience() {
  const { data, error } = await supabase
    .from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createExperience(fields) {
  const { data, error } = await supabase
    .from(TABLE).insert(fields).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Create failed — check Supabase RLS policies.');
  return data;
}

export async function updateExperience(id, fields) {
  const { data, error } = await supabase
    .from(TABLE).update(fields).eq('id', id).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Update failed — check Supabase RLS policies.');
  return data;
}

export async function deleteExperience(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function uploadExpLogo(id, file) {
  const ext  = file.name.split('.').pop();
  const path = `experience/${id}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return updateExperience(id, { logo_url: publicUrl });
}
