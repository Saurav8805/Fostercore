const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// POST /api/auth/login - User login
router.post('/login', async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    // Validate input
    if (!mobile || !password) {
      throw errorResponse('Mobile number and password are required', 400);
    }

    // Find user by mobile number
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('mobile', mobile)
      .single();

    if (userError || !user) {
      throw errorResponse('Invalid mobile number or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw errorResponse('Invalid mobile number or password', 401);
    }

    // Get additional user data based on role
    let userData = null;
    
    if (user.role === 19) {
      // Student
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();
      userData = studentData;
    } else if (user.role === 6 || user.role === 7 || user.role === 8) {
      // Staff/Faculty/Teacher
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', user.id)
        .single();
      userData = staffData;
    }

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = user;

    res.json(successResponse({
      user: {
        ...userWithoutPassword,
        additionalData: userData
      }
    }, 'Login successful'));

  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register - User registration (optional)
router.post('/register', async (req, res, next) => {
  try {
    const { mobile, password, full_name, email, role } = req.body;

    // Validate input
    if (!mobile || !password || !full_name) {
      throw errorResponse('Mobile, password, and full name are required', 400);
    }

    // Check if mobile already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('mobile')
      .eq('mobile', mobile)
      .single();

    if (existingUser) {
      throw errorResponse('Mobile number already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        mobile,
        password_hash: passwordHash,
        full_name,
        email: email || null,
        role: role || 19 // Default to student
      })
      .select()
      .single();

    if (userError) {
      throw errorResponse('Failed to create user account', 500);
    }

    const { password_hash, ...userWithoutPassword } = user;

    res.status(201).json(successResponse(
      { user: userWithoutPassword },
      'User registered successfully'
    ));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
