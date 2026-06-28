const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { supabase, supabaseAdmin } = require('../config/database');
const { getDefaultPassword } = require('../config/auth');
const { successResponse, errorResponse, parseIntSafe } = require('../utils/helpers');

// GET /api/students/list - Get all students
router.get('/list', async (req, res, next) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        user:user_id!left (
          id,
          mobile,
          full_name,
          email
        ),
        teacher:teacher_id!left (
          id,
          full_name
        )
      `)
      .order('roll_no', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Students fetch error:', error);
      throw errorResponse('Failed to fetch students', 500);
    }

    res.json(successResponse({
      students: students || [],
      count: students?.length || 0,
      timestamp: new Date().toISOString()
    }, 'Students fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/students/admit - Admit a new student
router.post('/admit', async (req, res, next) => {
  try {
    const { 
      studentName, 
      dob,
      age,
      admissionDate,
      aadharNumber,
      gender, 
      studentClass, 
      section,
      rollNo,
      bloodGroup,
      parentName,
      motherName,
      mobile, 
      email, 
      address,
      city,
      state,
      pincode,
      emergencyContact,
      teacherId
    } = req.body;

    // Validate required fields
    if (!studentName || !mobile || !studentClass) {
      throw errorResponse('Student name, mobile number, and class are required', 400);
    }

    // Check if mobile number already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('mobile')
      .eq('mobile', mobile)
      .single();

    if (existingUser) {
      throw errorResponse('Mobile number already registered', 400);
    }

    // Generate default password
    const defaultPassword = getDefaultPassword(19);
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create user account
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        mobile,
        password_hash: passwordHash,
        role: 19, // Student role
        full_name: studentName,
        email: email || null
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      throw errorResponse('Failed to create user account', 500);
    }

    // Create student record
    const rollNoValue = parseIntSafe(rollNo);
    const ageValue = parseIntSafe(age);
    
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        user_id: user.id,
        teacher_id: teacherId || null,
        student_name: studentName,
        mobile: mobile,
        email: email || null,
        class: studentClass,
        section: section || 'A',
        roll_no: rollNoValue,
        dob: dob || null,
        age: ageValue,
        gender: gender || null,
        admission_date: admissionDate || null,
        aadhar_number: aadharNumber || null,
        blood_group: bloodGroup || null,
        parent_name: parentName || null,
        mother_name: motherName || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        emergency_contact: emergencyContact || mobile
      })
      .select()
      .single();

    if (studentError) {
      console.error('Student creation error:', studentError);
      
      // Rollback: Delete the user if student creation fails
      await supabaseAdmin.from('users').delete().eq('id', user.id);
      
      throw errorResponse('Failed to create student record', 500);
    }

    res.status(201).json(successResponse({
      user,
      student,
      credentials: {
        mobile,
        password: defaultPassword
      }
    }, 'Student admitted successfully'));

  } catch (error) {
    next(error);
  }
});

// PUT /api/students/update/:id - Update student
router.put('/update/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update student record
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (studentError) {
      throw errorResponse('Failed to update student', 500);
    }

    res.json(successResponse(student, 'Student updated successfully'));

  } catch (error) {
    next(error);
  }
});

// DELETE /api/students/delete/:id - Delete student
router.delete('/delete/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get student to find user_id
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!student) {
      throw errorResponse('Student not found', 404);
    }

    // Delete student record
    const { error: studentError } = await supabaseAdmin
      .from('students')
      .delete()
      .eq('id', id);

    if (studentError) {
      throw errorResponse('Failed to delete student', 500);
    }

    // Delete user account
    await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', student.user_id);

    res.json(successResponse(null, 'Student deleted successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/students/teachers - Get all teachers
router.get('/teachers', async (req, res, next) => {
  try {
    const { data: teachers, error } = await supabase
      .from('users')
      .select('id, full_name, mobile, role')
      .in('role', [6, 7, 8]) // Admin, Teacher, Faculty
      .order('full_name');

    if (error) {
      throw errorResponse('Failed to fetch teachers', 500);
    }

    res.json(successResponse(teachers, 'Teachers fetched successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
