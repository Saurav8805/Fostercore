const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/homework/list - Get homework list
router.get('/list', async (req, res, next) => {
  try {
    const { studentClass, section } = req.query;

    let query = supabase
      .from('homework')
      .select('*')
      .order('created_at', { ascending: false });

    if (studentClass) {
      query = query.eq('class', studentClass);
    }

    if (section) {
      query = query.eq('section', section);
    }

    const { data: homework, error } = await query;

    if (error) {
      throw errorResponse('Failed to fetch homework', 500);
    }

    res.json(successResponse(homework, 'Homework fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/homework - Create homework
router.post('/', async (req, res, next) => {
  try {
    const { title, description, studentClass, section, subject, dueDate } = req.body;

    if (!title || !studentClass || !subject) {
      throw errorResponse('Title, class, and subject are required', 400);
    }

    const { data: homework, error } = await supabaseAdmin
      .from('homework')
      .insert({
        title,
        description: description || null,
        class: studentClass,
        section: section || null,
        subject,
        due_date: dueDate || null
      })
      .select()
      .single();

    if (error) {
      throw errorResponse('Failed to create homework', 500);
    }

    res.status(201).json(successResponse(homework, 'Homework created successfully'));

  } catch (error) {
    next(error);
  }
});

// PUT /api/homework/:id - Update homework
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: homework, error } = await supabaseAdmin
      .from('homework')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw errorResponse('Failed to update homework', 500);
    }

    res.json(successResponse(homework, 'Homework updated successfully'));

  } catch (error) {
    next(error);
  }
});

// DELETE /api/homework/:id - Delete homework
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('homework')
      .delete()
      .eq('id', id);

    if (error) {
      throw errorResponse('Failed to delete homework', 500);
    }

    res.json(successResponse(null, 'Homework deleted successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
