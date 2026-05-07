const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// POST /api/behaviour/add - Add behaviour record
router.post('/add', async (req, res, next) => {
  try {
    const { studentId, rating, comments, date } = req.body;

    if (!studentId || !rating) {
      throw errorResponse('Student ID and rating are required', 400);
    }

    const { data: behaviour, error } = await supabaseAdmin
      .from('behaviour')
      .insert({
        student_id: studentId,
        rating,
        comments: comments || null,
        date: date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) {
      throw errorResponse('Failed to add behaviour record', 500);
    }

    res.status(201).json(successResponse(behaviour, 'Behaviour record added successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/behaviour/my-behaviour - Get student's behaviour
router.get('/my-behaviour', async (req, res, next) => {
  try {
    const { studentId, startDate, endDate } = req.query;

    if (!studentId) {
      throw errorResponse('Student ID is required', 400);
    }

    let query = supabase
      .from('behaviour')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: behaviour, error } = await query;

    if (error) {
      throw errorResponse('Failed to fetch behaviour records', 500);
    }

    res.json(successResponse(behaviour, 'Behaviour records fetched successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
