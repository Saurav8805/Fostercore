const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/salary/history/:staffId - Get salary payment history for a staff member
router.get('/history/:staffId', async (req, res, next) => {
  try {
    const { staffId } = req.params;

    const { data: payments, error } = await supabase
      .from('salary_payments')
      .select('*')
      .eq('staff_id', staffId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Salary history fetch error:', error);
      // Return empty array if table doesn't exist
      return res.json(successResponse([], 'Salary history fetched successfully'));
    }

    res.json(successResponse(payments || [], 'Salary history fetched successfully'));

  } catch (error) {
    console.error('Salary history error:', error);
    res.json(successResponse([], 'Salary history fetched successfully'));
  }
});

// POST /api/salary/pay - Record a salary payment
router.post('/pay', async (req, res, next) => {
  try {
    const { staffId, amount, paymentDate, paymentMethod, remarks } = req.body;

    if (!staffId || !amount) {
      throw errorResponse('Staff ID and amount are required', 400);
    }

    const { data: payment, error } = await supabaseAdmin
      .from('salary_payments')
      .insert({
        staff_id: staffId,
        amount,
        payment_date: paymentDate || new Date().toISOString(),
        payment_method: paymentMethod || 'Cash',
        remarks: remarks || null
      })
      .select()
      .single();

    if (error) {
      console.error('Salary payment error:', error);
      
      // Check if table doesn't exist
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        throw errorResponse('Salary payments table not configured. Please contact administrator.', 500);
      }
      
      throw errorResponse('Failed to record salary payment', 500);
    }

    res.status(201).json(successResponse(payment, 'Salary payment recorded successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
