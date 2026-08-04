const { supabase, supabaseAdmin } = require('../config/supabase');
const { uploadFile, deleteFile, BUCKET_IMAGES } = require('../utils/supabaseStorage');

const TABLE = 'experience';

async function getExperience(req, res) {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch experience.' });
  }
}

async function createExperience(req, res) {
  try {
    const { company, role, description, start_date, end_date, location, technologies, responsibilities, achievements } = req.body;
    const tech  = Array.isArray(technologies)     ? technologies     : (technologies     || '').split(',').map(s => s.trim()).filter(Boolean);
    const resps = Array.isArray(responsibilities) ? responsibilities : (responsibilities || '').split('\n').map(s => s.trim()).filter(Boolean);
    const { data, error } = await supabaseAdmin
      .from(TABLE).insert({ company, role, description, start_date, end_date, location, technologies: tech, responsibilities: resps, achievements })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create experience.' });
  }
}

async function updateExperience(req, res) {
  try {
    const { id } = req.params;
    const { company, role, description, start_date, end_date, location, technologies, responsibilities, achievements } = req.body;
    const tech  = Array.isArray(technologies)     ? technologies     : (technologies     || '').split(',').map(s => s.trim()).filter(Boolean);
    const resps = Array.isArray(responsibilities) ? responsibilities : (responsibilities || '').split('\n').map(s => s.trim()).filter(Boolean);
    const { data, error } = await supabaseAdmin
      .from(TABLE).update({ company, role, description, start_date, end_date, location, technologies: tech, responsibilities: resps, achievements })
      .eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Experience not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update experience.' });
  }
}

async function deleteExperience(req, res) {
  try {
    const { id } = req.params;
    const { data: existing } = await supabaseAdmin.from(TABLE).select('logo_url').eq('id', id).single();
    if (existing?.logo_url) await deleteFile(existing.logo_url, BUCKET_IMAGES);
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete experience.' });
  }
}

async function uploadLogo(req, res) {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });
    const { data: existing } = await supabaseAdmin.from(TABLE).select('logo_url').eq('id', id).single();
    if (existing?.logo_url) await deleteFile(existing.logo_url, BUCKET_IMAGES);
    const fileName = `experience/logo_${id}_${Date.now()}.${req.file.mimetype.split('/')[1]}`;
    const url = await uploadFile(req.file.buffer, req.file.mimetype, fileName, BUCKET_IMAGES);
    const { data, error } = await supabaseAdmin.from(TABLE).update({ logo_url: url }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ logo_url: url, experience: data });
  } catch (err) {
    res.status(500).json({ error: 'Logo upload failed.' });
  }
}

module.exports = { getExperience, createExperience, updateExperience, deleteExperience, uploadLogo };
