const { supabase, supabaseAdmin } = require('../config/supabase');

const TABLE = 'social_links';

async function getSocialLinks(req, res) {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').order('platform');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch social links.' });
  }
}

async function upsertSocialLink(req, res) {
  try {
    const { platform, url } = req.body;
    // Upsert by platform name
    const { data: existing } = await supabaseAdmin
      .from(TABLE).select('id').eq('platform', platform).single();
    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from(TABLE).update({ url }).eq('id', existing.id).select().single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from(TABLE).insert({ platform, url }).select().single();
      if (error) throw error;
      result = data;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save social link.' });
  }
}

async function deleteSocialLink(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete social link.' });
  }
}

module.exports = { getSocialLinks, upsertSocialLink, deleteSocialLink };
