const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/gallery - Get gallery items
router.get('/', async (req, res, next) => {
  try {
    const { data: gallery, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw errorResponse('Failed to fetch gallery', 500);
    }

    res.json(successResponse(gallery, 'Gallery fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// POST /api/gallery - Add gallery item
router.post('/', async (req, res, next) => {
  try {
    const { title, description, imageUrl, category } = req.body;

    if (!title || !imageUrl) {
      throw errorResponse('Title and image URL are required', 400);
    }

    const { data: galleryItem, error } = await supabaseAdmin
      .from('gallery')
      .insert({
        title,
        description: description || null,
        image_url: imageUrl,
        category: category || null
      })
      .select()
      .single();

    if (error) {
      throw errorResponse('Failed to add gallery item', 500);
    }

    res.status(201).json(successResponse(galleryItem, 'Gallery item added successfully'));

  } catch (error) {
    next(error);
  }
});

// DELETE /api/gallery/:id - Delete gallery item
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) {
      throw errorResponse('Failed to delete gallery item', 500);
    }

    res.json(successResponse(null, 'Gallery item deleted successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
