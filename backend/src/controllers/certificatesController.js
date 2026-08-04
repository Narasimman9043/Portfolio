const { supabase, supabaseAdmin } = require('../config/supabase');
const { uploadFile, deleteFile, BUCKET_IMAGES } = require('../utils/supabaseStorage');

const TABLE = 'certificates';

async function getCertificates(req, res) {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates.' });
  }
}

async function createCertificate(req, res) {
  try {
    const { title, issuer, issue_date, credential_id, certificate_url } = req.body;
    const { data, error } = await supabaseAdmin
      .from(TABLE).insert({ title, issuer, issue_date, credential_id, certificate_url })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create certificate.' });
  }
}

async function updateCertificate(req, res) {
  try {
    const { id } = req.params;
    const { title, issuer, issue_date, credential_id, certificate_url } = req.body;
    const { data, error } = await supabaseAdmin
      .from(TABLE).update({ title, issuer, issue_date, credential_id, certificate_url })
      .eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Certificate not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update certificate.' });
  }
}

async function deleteCertificate(req, res) {
  try {
    const { id } = req.params;
    const { data: existing } = await supabaseAdmin.from(TABLE).select('certificate_image').eq('id', id).single();
    if (existing?.certificate_image) await deleteFile(existing.certificate_image, BUCKET_IMAGES);
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete certificate.' });
  }
}

async function uploadCertificateImage(req, res) {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });
    const { data: existing } = await supabaseAdmin.from(TABLE).select('certificate_image').eq('id', id).single();
    if (existing?.certificate_image) await deleteFile(existing.certificate_image, BUCKET_IMAGES);
    const fileName = `certificates/cert_${id}_${Date.now()}.${req.file.mimetype.split('/')[1]}`;
    const url = await uploadFile(req.file.buffer, req.file.mimetype, fileName, BUCKET_IMAGES);
    const { data, error } = await supabaseAdmin.from(TABLE).update({ certificate_image: url }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ certificate_image: url, certificate: data });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed.' });
  }
}

module.exports = { getCertificates, createCertificate, updateCertificate, deleteCertificate, uploadCertificateImage };
