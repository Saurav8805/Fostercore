const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/events - Get all events
router.get('/', async (req, res, next) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Events fetch error:', error);
      // Return empty array if error
      return res.json(successResponse([], 'Events fetched successfully'));
    }

    res.json(successResponse(events || [], 'Events fetched successfully'));

  } catch (error) {
    console.error('Events catch error:', error);
    res.json(successResponse([], 'Events fetched successfully'));
  }
});

// POST /api/events - Create event
router.post('/', async (req, res, next) => {
  try {
    const { title, description, date, type } = req.body;

    if (!title || !date) {
      throw errorResponse('Title and date are required', 400);
    }

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert({
        title,
        description: description || null,
        date: date,
        type: type || 'Event'
      })
      .select()
      .single();

    if (error) {
      console.error('Event insert error:', error);
      throw errorResponse('Failed to create event', 500);
    }

    res.status(201).json(successResponse(event, 'Event created successfully'));

  } catch (error) {
    next(error);
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date, type } = req.body;

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .update({
        title,
        description,
        date,
        type
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Event update error:', error);
      throw errorResponse('Failed to update event', 500);
    }

    res.json(successResponse(event, 'Event updated successfully'));

  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      throw errorResponse('Failed to delete event', 500);
    }

    res.json(successResponse(null, 'Event deleted successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
