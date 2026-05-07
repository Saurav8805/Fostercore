const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/users/profile - Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      throw errorResponse('User ID is required', 400);
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, mobile, full_name, email, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw errorResponse('User not found', 404);
    }

    // Get additional data based on role
    let additionalData = null;

    if (user.role === 19) {
      // Student
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .single();
      additionalData = studentData;
    } else if (user.role === 6 || user.role === 7 || user.role === 8) {
      // Staff
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .single();
      additionalData = staffData;
    }

    res.json(successResponse({
      user,
      additionalData
    }, 'Profile fetched successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
