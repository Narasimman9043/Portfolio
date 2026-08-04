const { supabaseAdmin } = require('../config/supabase');

const BUCKET_IMAGES  = 'portfolio-images';
const BUCKET_RESUME  = 'portfolio-resume';

/**
 * Upload a file buffer to Supabase Storage.
 * Returns the public URL.
 */
async function uploadFile(buffer, mimeType, fileName, bucket) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its public URL.
 */
async function deleteFile(publicUrl, bucket) {
  try {
    const path = publicUrl.split(`/storage/v1/object/public/${bucket}/`)[1];
    if (!path) return;
    await supabaseAdmin.storage.from(bucket).remove([path]);
  } catch (_) {
    // Non-critical — log and continue
    console.warn('Could not delete file from storage:', publicUrl);
  }
}

module.exports = { uploadFile, deleteFile, BUCKET_IMAGES, BUCKET_RESUME };
