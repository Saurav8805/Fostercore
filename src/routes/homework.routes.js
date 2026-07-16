const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/homework/list - Get homework list
router.get('/list', async (req, res, next) => {
  try {
    const { studentClass, section } = req.query;

    let query = supabaseAdmin
      .from('homework')
      .select(`
        *,
        teacher:assigned_by (
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (studentClass) {
      query = query.eq('class', studentClass);
    }

    if (section) {
      query = query.eq('section', section);
    }

    const { data: homework, error } = await query;

    if (error) {
      console.error('❌ Fetch homework error:', error);
      throw errorResponse('Failed to fetch homework', 500);
    }

    console.log('✅ Fetched homework:', homework);
    res.json(successResponse(homework, 'Homework fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/homework - Create homework
router.post('/', async (req, res, next) => {
  try {
    const { description, studentClass, section, subject, dueDate, assignedBy } = req.body;

    // Log the received data for debugging
    console.log('📝 Creating homework with data:', req.body);

    if (!studentClass || !subject || !description) {
      throw errorResponse('Class, subject, and description are required', 400);
    }

    // Prepare insert data - only include fields that exist in the table
    const insertData = {
      description,
      class: studentClass,
      subject,
      due_date: dueDate
    };

    // Add optional fields if they exist in the table
    if (section) insertData.section = section;
    if (assignedBy) insertData.assigned_by = assignedBy;

    console.log('💾 Insert data:', insertData);

    const { data: homework, error } = await supabaseAdmin
      .from('homework')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      throw errorResponse(`Failed to create homework: ${error.message}`, 500);
    }

    console.log('✅ Homework created successfully:', homework);
    res.status(201).json(successResponse(homework, 'Homework created successfully'));

  } catch (error) {
    console.error('❌ Route error:', error);
    next(error);
  }
});

// PUT /api/homework/:id - Update homework
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, studentClass, section, subject, dueDate } = req.body;

    const updateData = {
      description,
      class: studentClass,
      subject,
      due_date: dueDate
    };

    // Add optional fields
    if (section) updateData.section = section;

    const { data: homework, error } = await supabaseAdmin
      .from('homework')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      throw errorResponse(`Failed to update homework: ${error.message}`, 500);
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
