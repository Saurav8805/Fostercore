const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// POST /api/attendance/mark - Mark student attendance
router.post('/mark', async (req, res, next) => {
  try {
    const { studentId, date, status, remarks } = req.body;

    if (!studentId || !date || !status) {
      throw errorResponse('Student ID, date, and status are required', 400);
    }

    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .insert({
        student_id: studentId,
        date,
        status,
        remarks: remarks || null
      })
      .select()
      .single();

    if (error) {
      throw errorResponse('Failed to mark attendance', 500);
    }

    res.status(201).json(successResponse(attendance, 'Attendance marked successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/attendance/my-attendance - Get student's attendance
router.get('/my-attendance', async (req, res, next) => {
  try {
    const { studentId, startDate, endDate } = req.query;

    if (!studentId) {
      throw errorResponse('Student ID is required', 400);
    }

    let query = supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: attendance, error } = await query;

    if (error) {
      throw errorResponse('Failed to fetch attendance', 500);
    }

    res.json(successResponse(attendance, 'Attendance fetched successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
