const { supabase, supabaseAdmin } = require('../config/supabase');

const TABLE = 'education';

async function getEducation(req, res) {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').order('start_year', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch education.' });
  }
}

async function createEducation(req, res) {
  try {
    const { college, degree, specialization, start_year, end_year, cgpa, description } = req.body;
    const { data, error } = await supabaseAdmin
      .from(TABLE).insert({ college, degree, specialization, start_year, end_year, cgpa, description })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create education.' });
  }
}

async function updateEducation(req, res) {
  try {
    const { id } = req.params;
    const { college, degree, specialization, start_year, end_year, cgpa, description } = req.body;
    const { data, error } = await supabaseAdmin
      .from(TABLE).update({ college, degree, specialization, start_year, end_year, cgpa, description })
      .eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Education entry not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update education.' });
  }
}

async function deleteEducation(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete education.' });
  }
}

module.exports = { getEducation, createEducation, updateEducation, deleteEducation };
