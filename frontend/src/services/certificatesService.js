import { supabase } from '../lib/supabase';

const TABLE  = 'certificates';
const BUCKET = 'portfolio-images';

export async function getCertificates() {
  const { data, error } = await supabase
    .from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCertificate(fields) {
  const { data, error } = await supabase
    .from(TABLE).insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function updateCertificate(id, fields) {
  const { data, error } = await supabase
    .from(TABLE).update(fields).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCertificate(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function uploadCertImage(id, file) {
  const ext  = file.name.split('.').pop();
  const path = `certificates/${id}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return updateCertificate(id, { certificate_image: publicUrl });
}
