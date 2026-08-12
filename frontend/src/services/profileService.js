import { supabase } from '../lib/supabase';

const TABLE = 'users';

export async function getProfile() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(id, fields) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Update failed — check Supabase RLS policies allow writes.');
  return data;
}

export async function uploadProfilePhoto(id, file) {
  const ext  = file.name.split('.').pop();
  const path = `profile/avatar.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('portfolio-images')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(path);

  return updateProfile(id, { profile_image: publicUrl });
}
