const { supabase, supabaseAdmin } = require('../config/supabase');
const { uploadFile, deleteFile, BUCKET_IMAGES } = require('../utils/supabaseStorage');

const TABLE = 'projects';

async function getProjects(req, res) {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
}

async function createProject(req, res) {
  try {
    const { title, description, technologies, github_link, live_link, featured } = req.body;
    const tech = Array.isArray(technologies) ? technologies : (technologies || '').split(',').map(s => s.trim()).filter(Boolean);
    const { data, error } = await supabaseAdmin
      .from(TABLE).insert({ title, description, technologies: tech, github_link, live_link, featured: !!featured })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project.' });
  }
}

async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { title, description, technologies, github_link, live_link, featured } = req.body;
    const tech = Array.isArray(technologies) ? technologies : (technologies || '').split(',').map(s => s.trim()).filter(Boolean);
    const { data, error } = await supabaseAdmin
      .from(TABLE).update({ title, description, technologies: tech, github_link, live_link, featured: !!featured })
      .eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Project not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project.' });
  }
}

async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const { data: existing } = await supabaseAdmin.from(TABLE).select('image').eq('id', id).single();
    if (existing?.image) await deleteFile(existing.image, BUCKET_IMAGES);
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
}

async function uploadProjectImage(req, res) {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });
    const { data: existing } = await supabaseAdmin.from(TABLE).select('image').eq('id', id).single();
    if (existing?.image) await deleteFile(existing.image, BUCKET_IMAGES);
    const fileName = `projects/project_${id}_${Date.now()}.${req.file.mimetype.split('/')[1]}`;
    const url = await uploadFile(req.file.buffer, req.file.mimetype, fileName, BUCKET_IMAGES);
    const { data, error } = await supabaseAdmin.from(TABLE).update({ image: url }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ image: url, project: data });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed.' });
  }
}

module.exports = { getProjects, createProject, updateProject, deleteProject, uploadProjectImage };
