import { supabase } from '../lib/supabase';

const TABLE  = 'projects';
const BUCKET = 'portfolio-images';

export async function getProjects() {
  const { data, error } = await supabase
    .from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createProject(fields) {
  const { data, error } = await supabase
    .from(TABLE).insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, fields) {
  const { data, error } = await supabase
    .from(TABLE).update(fields).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function uploadProjectImage(id, file) {
  const ext  = file.name.split('.').pop();
  const path = `projects/${id}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return updateProject(id, { image: publicUrl });
}
