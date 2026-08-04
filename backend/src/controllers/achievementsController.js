const { supabase, supabaseAdmin } = require('../config/supabase');

const TABLE = 'achievements';

async function getAchievements(req, res) {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch achievements.' });
  }
}

async function createAchievement(req, res) {
  try {
    const { title, description } = req.body;
    const { data, error } = await supabaseAdmin
      .from(TABLE).insert({ title, description }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create achievement.' });
  }
}

async function updateAchievement(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const { data, error } = await supabaseAdmin
      .from(TABLE).update({ title, description }).eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Achievement not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update achievement.' });
  }
}

async function deleteAchievement(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete achievement.' });
  }
}

module.exports = { getAchievements, createAchievement, updateAchievement, deleteAchievement };
