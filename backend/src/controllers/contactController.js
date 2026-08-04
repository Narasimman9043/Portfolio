const xss = require('xss');
const { supabase, supabaseAdmin } = require('../config/supabase');

const TABLE = 'contact_messages';

/** POST /api/contact — public, rate-limited */
async function submitContact(req, res) {
  try {
    const name    = xss(req.body.name?.trim()    || '');
    const email   = xss(req.body.email?.trim()   || '');
    const subject = xss(req.body.subject?.trim() || '');
    const message = xss(req.body.message?.trim() || '');

    if (!name || !email || !message)
      return res.status(400).json({ error: 'Name, email, and message are required.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: 'Invalid email address.' });

    const { data, error } = await supabaseAdmin
      .from(TABLE).insert({ name, email, subject, message }).select().single();

    if (error) throw error;
    res.status(201).json({ message: 'Message sent successfully! I will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}

/** GET /api/contact — admin only */
async function getMessages(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
}

/** PATCH /api/contact/:id/read — admin only */
async function markRead(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from(TABLE).update({ is_read: true }).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update message.' });
  }
}

/** DELETE /api/contact/:id — admin only */
async function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
}

module.exports = { submitContact, getMessages, markRead, deleteMessage };
