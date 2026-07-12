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

// PUT /api/fees/update - Create or update student fees
router.put('/update', async (req, res, next) => {
  try {
    const { studentId, totalFees, paidAmount, pendingAmount, dueDate, status } = req.body;

    if (!studentId || totalFees === undefined) {
      throw errorResponse('Student ID and total fees are required', 400);
    }

    // Check if fees already exist for this student
    const { data: existingFees, error: fetchError } = await supabase
      .from('fees')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing fees:', fetchError);
      throw errorResponse('Failed to check existing fees', 500);
    }

    let result;
    if (existingFees) {
      // Update existing fees
      const { data: updatedFee, error: updateError } = await supabaseAdmin
        .from('fees')
        .update({
          total_fees: totalFees,
          paid_amount: paidAmount || 0,
          pending_amount: pendingAmount || (totalFees - (paidAmount || 0)),
          due_date: dueDate,
          status: status || 'Pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingFees.id)
        .select()
        .single();

      if (updateError) {
        console.error('Fee update error:', updateError);
        throw errorResponse('Failed to update fees', 500);
      }
      result = updatedFee;
    } else {
      // Create new fees
      const { data: newFee, error: insertError } = await supabaseAdmin
        .from('fees')
        .insert({
          student_id: studentId,
          total_fees: totalFees,
          paid_amount: paidAmount || 0,
          pending_amount: pendingAmount || (totalFees - (paidAmount || 0)),
          due_date: dueDate,
          status: status || 'Pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Fee insert error:', insertError);
        throw errorResponse('Failed to create fees', 500);
      }
      result = newFee;
    }

    res.json(successResponse(result, 'Fees updated successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
