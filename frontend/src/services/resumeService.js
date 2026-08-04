import { supabase } from '../lib/supabase';

const TABLE  = 'resume';
const BUCKET = 'portfolio-resume';

export async function getResume() {
  const { data, error } = await supabase
    .from(TABLE).select('*').limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function uploadResume(file) {
  const path = `resume/resume.pdf`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET).upload(path, file, { upsert: true, contentType: 'application/pdf' });
  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

  // Upsert — update if exists, insert if not
  const existing = await getResume();
  if (existing) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ resume_file: publicUrl, file_name: file.name, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ resume_file: publicUrl, file_name: file.name })
      .select().single();
    if (error) throw error;
    return data;
  }
}

export async function deleteResume() {
  const existing = await getResume();
  if (!existing) return;
  // Remove storage file
  await supabase.storage.from(BUCKET).remove(['resume/resume.pdf']);
  // Remove DB row
  const { error } = await supabase.from(TABLE).delete().eq('id', existing.id);
  if (error) throw error;
}
