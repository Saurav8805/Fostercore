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
      designation, 
      department, 
      joiningDate, 
      salary,
      // Ignore address and other fields not in staff table
    } = req.body;

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
    const { date } = req.query;

    let query = supabase
      .from('staff_attendance')
      .select(`
        *,
        staff:staff_id (
          id,
          user:user_id (
            full_name
          )
        )
      `)
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data: attendance, error } = await query;

    if (error) {
      throw errorResponse('Failed to fetch staff attendance', 500);
    }

    res.json(successResponse(attendance, 'Staff attendance fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/staff/attendance - Mark staff attendance
router.post('/attendance', async (req, res, next) => {
  try {
    const { staffId, date, status, remarks } = req.body;

    if (!staffId || !date || !status) {
      throw errorResponse('Staff ID, date, and status are required', 400);
    }

    const { data: attendance, error } = await supabaseAdmin
      .from('staff_attendance')
      .insert({
        staff_id: staffId,
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

module.exports = router;
