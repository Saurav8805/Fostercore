const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/fees/my-fees - Get student's fees
router.get('/my-fees', async (req, res, next) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      throw errorResponse('Student ID is required', 400);
    }

    const { data: fees, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw errorResponse('Failed to fetch fees', 500);
    }

    res.json(successResponse(fees, 'Fees fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// PUT /api/fees/update - Update fee payment
router.put('/update', async (req, res, next) => {
  try {
    const { feeId, amountPaid, paymentDate, paymentMethod, remarks } = req.body;

    if (!feeId || !amountPaid) {
      throw errorResponse('Fee ID and amount paid are required', 400);
    }

    const { data: fee, error } = await supabaseAdmin
      .from('fees')
      .update({
        amount_paid: amountPaid,
        payment_date: paymentDate || new Date().toISOString(),
        payment_method: paymentMethod || null,
        remarks: remarks || null,
        status: 'paid'
      })
      .eq('id', feeId)
      .select()
      .single();

    if (error) {
      throw errorResponse('Failed to update fee', 500);
    }

    res.json(successResponse(fee, 'Fee updated successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
