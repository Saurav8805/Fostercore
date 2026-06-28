const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/attendance/student - Get student attendance (bulk fetch for marking)
router.get('/student', async (req, res, next) => {
  try {
    const { date, studentId, startDate, endDate } = req.query;

    console.log('📊 Fetching student attendance with params:', { date, studentId, startDate, endDate });

    let query = supabaseAdmin
      .from('student_attendance')
      .select('*')
      .order('date', { ascending: false });

    // Filter by specific date
    if (date) {
      query = query.eq('date', date);
    }

    // Filter by student
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    // Filter by date range
    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    } else if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: attendance, error } = await query;

    console.log('📊 Query result:', { 
      count: attendance?.length || 0, 
      error: error?.message,
      sample: attendance?.[0]
    });

    if (error) {
      console.error('Attendance fetch error:', error);
      throw errorResponse('Failed to fetch student attendance', 500);
    }

    // Calculate statistics if filtering by student
    let stats = null;
    if (studentId && attendance) {
      const totalDays = attendance.length;
      const present = attendance.filter(a => a.status === 'Present').length;
      const absent = attendance.filter(a => a.status === 'Absent').length;
      const leave = attendance.filter(a => a.status === 'Leave').length;
      const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

      stats = {
        totalDays,
        present,
        absent,
        leave,
        percentage
      };
    }

    res.json(successResponse({
      attendance: attendance || [],
      stats
    }, 'Student attendance fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/attendance/student - Mark student attendance (bulk)
router.post('/student', async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      throw errorResponse('Date and attendance records are required', 400);
    }

    console.log('📝 Marking attendance for', records.length, 'students on', date);

    // Prepare attendance records for bulk insert
    const attendanceRecords = records.map(record => ({
      student_id: record.studentId,
      date: date,
      status: record.status,
      remarks: record.remarks || null
    }));

    // Check if attendance already exists for this date
    const { data: existingRecords } = await supabaseAdmin
      .from('student_attendance')
      .select('id, student_id')
      .eq('date', date);

    if (existingRecords && existingRecords.length > 0) {
      // Update existing records
      console.log('📝 Updating existing attendance records');
      const updatePromises = attendanceRecords.map(async (record) => {
        const existing = existingRecords.find(e => e.student_id === record.student_id);
        if (existing) {
          return supabaseAdmin
            .from('student_attendance')
            .update({
              status: record.status,
              remarks: record.remarks
            })
            .eq('id', existing.id);
        } else {
          return supabaseAdmin
            .from('student_attendance')
            .insert(record);
        }
      });

      await Promise.all(updatePromises);
    } else {
      // Insert new records
      console.log('📝 Inserting new attendance records');
      const { error: insertError } = await supabaseAdmin
        .from('student_attendance')
        .insert(attendanceRecords);

      if (insertError) {
        console.error('Attendance insert error:', insertError);
        throw errorResponse('Failed to mark attendance', 500);
      }
    }

    res.status(201).json(successResponse({
      date,
      count: attendanceRecords.length
    }, 'Attendance marked successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/attendance/mark - Mark student attendance (single - legacy)
router.post('/mark', async (req, res, next) => {
  try {
    const { studentId, date, status, remarks } = req.body;

    if (!studentId || !date || !status) {
      throw errorResponse('Student ID, date, and status are required', 400);
    }

    const { data: attendance, error } = await supabaseAdmin
      .from('student_attendance')
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
      .from('student_attendance')
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
