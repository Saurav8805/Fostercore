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
      .order('event_date', { ascending: false });

    if (error) {
      throw errorResponse('Failed to fetch events', 500);
    }

    res.json(successResponse(events, 'Events fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/events - Create event
router.post('/', async (req, res, next) => {
  try {
    const { title, description, eventDate, location, imageUrl } = req.body;

    if (!title || !eventDate) {
      throw errorResponse('Title and event date are required', 400);
    }

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert({
        title,
        description: description || null,
        event_date: eventDate,
        location: location || null,
        image_url: imageUrl || null
      })
      .select()
      .single();

    if (error) {
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
    const updateData = req.body;

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
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
