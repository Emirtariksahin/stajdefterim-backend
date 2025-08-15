const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get voice notes for a specific day
router.get('/:internship_id/:day_number', async (req, res) => {
  try {
    const userId = req.user.id;
    const { internship_id, day_number } = req.params;

    console.log('🎤 Getting voice notes:', { internship_id, day_number });

    const { data, error } = await req.supabase
      .from('voice_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('internship_id', internship_id)
      .eq('day_number', parseInt(day_number))
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Voice notes fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch voice notes'
      });
    }

    console.log(`✅ Found ${data?.length || 0} voice notes`);

    res.json({
      success: true,
      data: {
        voice_notes: data || []
      }
    });

  } catch (error) {
    console.error('❌ Voice notes fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voice notes'
    });
  }
});

// Create a new voice note
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      internship_id,
      day_number,
      topic,
      file_path,
      duration_seconds
    } = req.body;

    console.log('🎤 Creating voice note:', { internship_id, day_number, topic });

    // Validate required fields
    if (!internship_id || !day_number || !file_path) {
      return res.status(400).json({
        success: false,
        error: 'Internship ID, day number, and file path are required'
      });
    }

    const voiceNoteData = {
      user_id: userId,
      internship_id,
      day_number: parseInt(day_number),
      topic: topic?.trim() || null,
      file_path,
      duration_seconds: duration_seconds || 0
    };

    const { data, error } = await req.supabase
      .from('voice_notes')
      .insert(voiceNoteData)
      .select()
      .single();

    if (error) {
      console.error('❌ Voice note creation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create voice note'
      });
    }

    console.log('✅ Voice note created successfully');

    res.status(201).json({
      success: true,
      data: {
        voice_note: data
      },
      message: 'Voice note created successfully'
    });

  } catch (error) {
    console.error('❌ Voice note creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create voice note'
    });
  }
});

// Update a voice note
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { topic, duration_seconds } = req.body;

    console.log('🎤 Updating voice note:', id);

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (topic !== undefined) updateData.topic = topic?.trim() || null;
    if (duration_seconds !== undefined) updateData.duration_seconds = duration_seconds;

    const { data, error } = await req.supabase
      .from('voice_notes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId) // Security: ensure user owns this voice note
      .select()
      .single();

    if (error) {
      console.error('❌ Voice note update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update voice note'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Voice note not found or access denied'
      });
    }

    console.log('✅ Voice note updated successfully');

    res.json({
      success: true,
      data: {
        voice_note: data
      },
      message: 'Voice note updated successfully'
    });

  } catch (error) {
    console.error('❌ Voice note update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update voice note'
    });
  }
});

// Delete a voice note
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log('🗑️ Deleting voice note:', id);

    const { data, error } = await req.supabase
      .from('voice_notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // Security: ensure user owns this voice note
      .select()
      .single();

    if (error) {
      console.error('❌ Voice note deletion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete voice note'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Voice note not found or access denied'
      });
    }

    console.log('✅ Voice note deleted successfully');

    res.json({
      success: true,
      message: 'Voice note deleted successfully'
    });

  } catch (error) {
    console.error('❌ Voice note deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete voice note'
    });
  }
});

// Get all voice notes for an internship (for overview)
router.get('/:internship_id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { internship_id } = req.params;

    console.log('🎤 Getting all voice notes for internship:', internship_id);

    const { data, error } = await req.supabase
      .from('voice_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('internship_id', internship_id)
      .order('day_number', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Voice notes fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch voice notes'
      });
    }

    console.log(`✅ Found ${data?.length || 0} voice notes for internship`);

    res.json({
      success: true,
      data: {
        voice_notes: data || []
      }
    });

  } catch (error) {
    console.error('❌ Voice notes fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voice notes'
    });
  }
});

module.exports = router;