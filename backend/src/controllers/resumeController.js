const { supabase, supabaseAdmin } = require('../config/supabase');
const { uploadFile, deleteFile, BUCKET_RESUME } = require('../utils/supabaseStorage');

const TABLE = 'resume';

async function getResume(req, res) {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').limit(1).single();
    if (error && error.code === 'PGRST116') return res.json(null); // no resume yet
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resume.' });
  }
}

async function uploadResume(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file provided.' });
    if (req.file.mimetype !== 'application/pdf')
      return res.status(400).json({ error: 'Only PDF files are accepted.' });

    // Delete old resume if exists
    const { data: existing } = await supabaseAdmin.from(TABLE).select('*').limit(1).single();
    if (existing?.resume_file) await deleteFile(existing.resume_file, BUCKET_RESUME);

    const fileName = `resume_${Date.now()}.pdf`;
    const url = await uploadFile(req.file.buffer, 'application/pdf', fileName, BUCKET_RESUME);

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from(TABLE).update({ resume_file: url, file_name: req.file.originalname, updated_at: new Date() })
        .eq('id', existing.id).select().single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from(TABLE).insert({ resume_file: url, file_name: req.file.originalname })
        .select().single();
      if (error) throw error;
      result = data;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Resume upload failed.' });
  }
}

async function deleteResume(req, res) {
  try {
    const { data: existing } = await supabaseAdmin.from(TABLE).select('*').limit(1).single();
    if (!existing) return res.status(404).json({ error: 'No resume found.' });
    if (existing.resume_file) await deleteFile(existing.resume_file, BUCKET_RESUME);
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', existing.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resume.' });
  }
}

module.exports = { getResume, uploadResume, deleteResume };
