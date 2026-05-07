const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// POST /api/progress/add - Add academic progress
router.post('/add', async (req, res, next) => {
  try {
    const { studentId, subject, marks, maxMarks, grade, term, remarks } = req.body;

    if (!studentId || !subject || marks === undefined) {
      throw errorResponse('Student ID, subject, and marks are required', 400);
    }

    const { data: progress, error } = await supabaseAdmin
      .from('progress')
      .insert({
        student_id: studentId,
        subject,
        marks,
        max_marks: maxMarks || 100,
        grade: grade || null,
        term: term || null,
        remarks: remarks || null
      })
      .select()
      .single();

    if (error) {
      throw errorResponse('Failed to add progress', 500);
    }

    res.status(201).json(successResponse(progress, 'Progress added successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/progress/my-progress - Get student's progress
router.get('/my-progress', async (req, res, next) => {
  try {
    const { studentId, term } = req.query;

    if (!studentId) {
      throw errorResponse('Student ID is required', 400);
    }

    let query = supabase
      .from('progress')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (term) {
      query = query.eq('term', term);
    }

    const { data: progress, error } = await query;

    if (error) {
      throw errorResponse('Failed to fetch progress', 500);
    }

    res.json(successResponse(progress, 'Progress fetched successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
