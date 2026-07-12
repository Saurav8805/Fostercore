const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/syllabus/list - Get all syllabus entries (all roles)
router.get('/list', async (req, res, next) => {
  try {
    const { studentClass, subject } = req.query;

    let query = supabase
      .from('syllabus')
      .select('*')
      .order('created_at', { ascending: false });

    if (studentClass) query = query.eq('class', studentClass);
    if (subject) query = query.eq('subject', subject);

    const { data: syllabus, error } = await query;

    if (error) throw errorResponse('Failed to fetch syllabus', 500);

    res.json(successResponse(syllabus, 'Syllabus fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// POST /api/syllabus - Create syllabus entry (admin/staff only)
router.post('/', async (req, res, next) => {
  try {
    const { studentClass, subject, topics, description, status } = req.body;

    if (!studentClass || !subject || !topics) {
      throw errorResponse('Class, subject, and topics are required', 400);
    }

    const { data: syllabus, error } = await supabaseAdmin
      .from('syllabus')
      .insert({
        class: studentClass,
        subject,
        topics,
        description: description || null,
        status: status || 'Active'
      })
      .select()
      .single();

    if (error) throw errorResponse('Failed to create syllabus', 500);

    res.status(201).json(successResponse(syllabus, 'Syllabus created successfully'));
  } catch (error) {
    next(error);
  }
});

// PUT /api/syllabus/:id - Update syllabus entry (admin/staff only)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentClass, subject, topics, description, status } = req.body;

    const updateData = {};
    if (studentClass) updateData.class = studentClass;
    if (subject) updateData.subject = subject;
    if (topics) updateData.topics = topics;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;

    const { data: syllabus, error } = await supabaseAdmin
      .from('syllabus')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw errorResponse('Failed to update syllabus', 500);

    res.json(successResponse(syllabus, 'Syllabus updated successfully'));
  } catch (error) {
    next(error);
  }
});

// DELETE /api/syllabus/:id - Delete syllabus entry (admin only)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('syllabus')
      .delete()
      .eq('id', id);

    if (error) throw errorResponse('Failed to delete syllabus', 500);

    res.json(successResponse(null, 'Syllabus deleted successfully'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
