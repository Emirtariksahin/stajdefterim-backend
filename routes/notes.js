const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all notes for the user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { internship_id, day, day_number, topic } = req.query;

    let query = req.supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (internship_id) {
      query = query.eq('internship_id', internship_id);
    }

    if (day) {
      query = query.eq('day', parseInt(day));
    }

    if (day_number) {
      query = query.eq('day_number', parseInt(day_number));
    }

    if (topic) {
      query = query.ilike('topic', `%${topic}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Notes fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch notes'
      });
    }

    res.json({
      success: true,
      data: {
        notes: data || []
      }
    });

  } catch (error) {
    console.error('Notes fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes'
    });
  }
});

// Create new note
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      topic,
      content,
      day,
      day_number,
      internship_id
    } = req.body;

    // Validate required fields
    if (!topic || !content) {
      return res.status(400).json({
        success: false,
        error: 'Topic and content are required'
      });
    }

    const noteData = {
      user_id: userId,
      topic,
      content,
      day: day || null,
      day_number: day_number ? parseInt(day_number) : null,
      internship_id: internship_id || null
    };

    const { data, error } = await req.supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single();

    if (error) {
      console.error('Note creation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create note'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        note: data,
        message: 'Note created successfully'
      }
    });

  } catch (error) {
    console.error('Note creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create note'
    });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const {
      topic,
      content,
      day
    } = req.body;

    // Build update object
    const updateData = {};
    if (topic !== undefined) updateData.topic = topic;
    if (content !== undefined) updateData.content = content;
    if (day !== undefined) updateData.day = day;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
    }

    const { data, error } = await req.supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Note update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update note'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.json({
      success: true,
      data: {
        note: data,
        message: 'Note updated successfully'
      }
    });

  } catch (error) {
    console.error('Note update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update note'
    });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const { error } = await req.supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) {
      console.error('Note deletion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete note'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Note deleted successfully'
      }
    });

  } catch (error) {
    console.error('Note deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete note'
    });
  }
});

module.exports = router;