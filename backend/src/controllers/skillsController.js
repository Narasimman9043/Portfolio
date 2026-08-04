const { supabase, supabaseAdmin } = require('../config/supabase');

const TABLE = 'skills';

async function getSkills(req, res) {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').order('sort_order').order('created_at');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch skills.' });
  }
}

async function createSkill(req, res) {
  try {
    const { skill_name, category, level, icon } = req.body;
    const { count } = await supabaseAdmin.from(TABLE).select('*', { count: 'exact', head: true });
    const { data, error } = await supabaseAdmin
      .from(TABLE).insert({ skill_name, category, level: level || 80, icon, sort_order: count || 0 })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create skill.' });
  }
}

async function updateSkill(req, res) {
  try {
    const { id } = req.params;
    const { skill_name, category, level, icon } = req.body;
    const { data, error } = await supabaseAdmin
      .from(TABLE).update({ skill_name, category, level, icon }).eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Skill not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update skill.' });
  }
}

async function deleteSkill(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete skill.' });
  }
}

async function reorderSkills(req, res) {
  try {
    const { ordered_ids } = req.body; // array of UUIDs in new order
    const updates = ordered_ids.map((id, idx) =>
      supabaseAdmin.from(TABLE).update({ sort_order: idx }).eq('id', id)
    );
    await Promise.all(updates);
    const { data } = await supabaseAdmin.from(TABLE).select('*').order('sort_order');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder skills.' });
  }
}

module.exports = { getSkills, createSkill, updateSkill, deleteSkill, reorderSkills };
