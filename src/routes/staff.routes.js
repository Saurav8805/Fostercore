const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { supabase, supabaseAdmin } = require('../config/database');
const { getDefaultPassword } = require('../config/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/staff/list - Get all staff
router.get('/list', async (req, res, next) => {
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select(`
        *,
        user:user_id (
          id,
          mobile,
          full_name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw errorResponse('Failed to fetch staff', 500);
    }

    res.json(successResponse(staff, 'Staff fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/staff/add - Add new staff
router.post('/add', async (req, res, next) => {
  try {
    const {
      fullName,
      mobile,
      email,
      role,
      designation,
      department,
      dateOfJoining,
      salary,
      address
    } = req.body;

    // Validate required fields
    if (!fullName || !mobile || !role) {
      throw errorResponse('Full name, mobile, and role are required', 400);
    }

    // Check if mobile already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('mobile')
      .eq('mobile', mobile)
      .single();

    if (existingUser) {
      throw errorResponse('Mobile number already registered', 400);
    }

    // Generate default password
    const defaultPassword = getDefaultPassword(role);
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create user account
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        mobile,
        password_hash: passwordHash,
        role,
        full_name: fullName,
        email: email || null
      })
      .select()
      .single();

    if (userError) {
      throw errorResponse('Failed to create user account', 500);
    }

    // Create staff record - MINIMAL: only user_id is required
    // We'll insert only user_id first to avoid column errors
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff')
      .insert({
        user_id: user.id
      })
      .select()
      .single();

    if (staffError) {
      console.error('Staff creation error:', staffError);
      // Rollback - delete the user that was just created
      await supabaseAdmin.from('users').delete().eq('id', user.id);
      throw errorResponse(`Failed to create staff record: ${staffError.message}`, 500);
    }

    // Try to update with optional fields if they were provided
    // This way we can see which fields actually exist in the table
    if (designation || department || salary) {
      const updateData = {};
      if (designation) updateData.designation = designation;
      if (department) updateData.department = department;
      if (salary) updateData.salary = salary;

      // Try to update, but don't fail if columns don't exist
      try {
        await supabaseAdmin
          .from('staff')
          .update(updateData)
          .eq('id', staff.id);
      } catch (updateError) {
        console.log('Optional fields update failed (columns may not exist):', updateError);
        // Don't throw error, staff is already created
      }
    }

    res.status(201).json(successResponse({
      user,
      staff,
      credentials: {
        mobile,
        password: defaultPassword
      }
    }, 'Staff added successfully'));

  } catch (error) {
    next(error);
  }
});

// PUT /api/staff/update/:id - Update staff
router.put('/update/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      userId,
      fullName,
      mobile,
      email,
      designation, 
      department, 
      joiningDate, 
      salary,
    } = req.body;

    // Update user info if provided
    if (userId && (fullName !== undefined || email !== undefined || mobile !== undefined || designation !== undefined)) {
      const userUpdateData = {};
      if (fullName !== undefined) userUpdateData.full_name = fullName;
      if (email !== undefined) userUpdateData.email = email;
      if (mobile !== undefined) userUpdateData.mobile = mobile;
      
      // Update role based on designation
      if (designation !== undefined) {
        if (['Principal', 'Vice-Principal', 'Admin'].includes(designation)) {
          userUpdateData.role = 6; // Full admin access
        } else {
          userUpdateData.role = 7; // Teaching staff (Teacher/Support Staff)
        }
      }

      await supabaseAdmin
        .from('users')
        .update(userUpdateData)
        .eq('id', userId);
    }

    // Only update fields that exist in staff table
    const updateData = {};
    if (designation !== undefined) updateData.designation = designation;
    if (department !== undefined) updateData.department = department;
    if (joiningDate !== undefined) updateData.date_of_joining = joiningDate;
    if (salary !== undefined) updateData.salary = salary;

    const { data: staff, error } = await supabaseAdmin
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Staff update error:', error);
      throw errorResponse(`Failed to update staff: ${error.message}`, 500);
    }

    res.json(successResponse(staff, 'Staff updated successfully'));

  } catch (error) {
    next(error);
  }
});

// DELETE /api/staff/delete/:id - Delete staff
router.delete('/delete/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get staff to find user_id
    const { data: staff } = await supabaseAdmin
      .from('staff')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!staff) {
      throw errorResponse('Staff not found', 404);
    }

    // Delete staff record
    await supabaseAdmin.from('staff').delete().eq('id', id);

    // Delete user account
    await supabaseAdmin.from('users').delete().eq('id', staff.user_id);

    res.json(successResponse(null, 'Staff deleted successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/staff/attendance - Get staff attendance
router.get('/attendance', async (req, res, next) => {
  try {
    const { date, staffId, startDate, endDate } = req.query;

    console.log('📊 Fetching attendance with params:', { date, staffId, startDate, endDate });

    let query = supabaseAdmin
      .from('staff_attendance')
      .select('*')
      .order('date', { ascending: false });

    // Filter by specific date
    if (date) {
      query = query.eq('date', date);
    }

    // Filter by staff member
    if (staffId) {
      query = query.eq('staff_id', staffId);
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
      throw errorResponse('Failed to fetch staff attendance', 500);
    }

    // Calculate statistics if filtering by staff
    let stats = null;
    if (staffId && attendance) {
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
    }, 'Staff attendance fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/staff/attendance - Mark staff attendance
router.post('/attendance', async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      throw errorResponse('Date and attendance records are required', 400);
    }

    // Prepare attendance records for bulk insert
    const attendanceRecords = records.map(record => ({
      staff_id: record.staffId,
      date: date,
      status: record.status,
      remarks: record.remarks || null
    }));

    // Check if attendance already exists for this date
    const { data: existingRecords } = await supabaseAdmin
      .from('staff_attendance')
      .select('id, staff_id')
      .eq('date', date);

    if (existingRecords && existingRecords.length > 0) {
      // Update existing records
      const updatePromises = attendanceRecords.map(async (record) => {
        const existing = existingRecords.find(e => e.staff_id === record.staff_id);
        if (existing) {
          return supabaseAdmin
            .from('staff_attendance')
            .update({
              status: record.status,
              remarks: record.remarks
            })
            .eq('id', existing.id);
        } else {
          return supabaseAdmin
            .from('staff_attendance')
            .insert(record);
        }
      });

      await Promise.all(updatePromises);
    } else {
      // Insert new records
      const { error: insertError } = await supabaseAdmin
        .from('staff_attendance')
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

module.exports = router;
