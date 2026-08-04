import { supabase } from '../lib/supabase';

const TABLE = 'contact_messages';

export async function submitContact(fields) {
  const { data, error } = await supabase
    .from(TABLE).insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function getMessages() {
  const { data, error } = await supabase
    .from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markRead(id) {
  const { data, error } = await supabase
    .from(TABLE).update({ is_read: true }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMessage(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
