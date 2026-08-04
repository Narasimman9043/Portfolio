const { supabase, supabaseAdmin } = require('../config/supabase');
const { uploadFile, BUCKET_IMAGES } = require('../utils/supabaseStorage');

/** GET /api/profile */
async function getProfile(req, res) {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1).single();
    if (error) return res.status(404).json({ error: 'Profile not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
}

/** PUT /api/profile */
async function updateProfile(req, res) {
  try {
    const { full_name, designation, email, phone, location, about, github_url, linkedin_url, portfolio_url } = req.body;

    // Get the existing profile id
    const { data: existing } = await supabaseAdmin.from('users').select('id').limit(1).single();
    if (!existing) return res.status(404).json({ error: 'Profile not found.' });

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ full_name, designation, email, phone, location, about, github_url, linkedin_url, portfolio_url, updated_at: new Date() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}

/** POST /api/profile/image — multipart/form-data, field: image */
async function uploadProfileImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });
    const fileName = `profile/profile_${Date.now()}.${req.file.mimetype.split('/')[1]}`;
    const url = await uploadFile(req.file.buffer, req.file.mimetype, fileName, BUCKET_IMAGES);

    const { data: existing } = await supabaseAdmin.from('users').select('id').limit(1).single();
    const { data, error } = await supabaseAdmin
      .from('users').update({ profile_image: url, updated_at: new Date() })
      .eq('id', existing.id).select().single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile_image: url, user: data });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed.' });
  }
}

module.exports = { getProfile, updateProfile, uploadProfileImage };
