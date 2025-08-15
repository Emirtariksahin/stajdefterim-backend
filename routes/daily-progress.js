const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get daily progress for an internship
router.get('/:internship_id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { internship_id } = req.params;

    console.log('📊 Getting daily progress for internship:', internship_id);

    const { data, error } = await req.supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('internship_id', internship_id)
      .order('day_number', { ascending: true });

    if (error) {
      console.error('❌ Daily progress fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch daily progress'
      });
    }

    console.log(`✅ Found ${data?.length || 0} daily progress records`);

    res.json({
      success: true,
      data: {
        daily_progress: data || []
      }
    });

  } catch (error) {
    console.error('❌ Daily progress fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily progress'
    });
  }
});

// Complete a day (create or update daily progress)
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      internship_id,
      day_number,
      completed_tasks,
      earned_credits,
      earned_exp,
      completion_percentage
    } = req.body;

    console.log('📝 Completing day:', { day_number, internship_id, completed_tasks: completed_tasks?.length });

    // Validate required fields
    if (!internship_id || !day_number) {
      return res.status(400).json({
        success: false,
        error: 'Internship ID and day number are required'
      });
    }

    // Check if day progress already exists
    const { data: existing } = await req.supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('internship_id', internship_id)
      .eq('day_number', day_number)
      .single();

    const progressData = {
      user_id: userId,
      internship_id,
      day_number,
      completed_tasks: completed_tasks || [],
      earned_credits: earned_credits || 0,
      earned_exp: earned_exp || 0,
      completion_percentage: completion_percentage || 0,
      is_completed: (completion_percentage || 0) === 100,
      completed_at: (completion_percentage || 0) === 100 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existing) {
      // Update existing progress
      const { data, error } = await req.supabase
        .from('daily_progress')
        .update(progressData)
        .eq('id', existing.id)
        .select()
        .single();

      result = { data, error };
      console.log('🔄 Updated existing daily progress');
    } else {
      // Create new progress
      const { data, error } = await req.supabase
        .from('daily_progress')
        .insert(progressData)
        .select()
        .single();

      result = { data, error };
      console.log('➕ Created new daily progress');
    }

    if (result.error) {
      console.error('❌ Daily progress save error:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save daily progress'
      });
    }

    console.log('✅ Daily progress saved successfully');

    res.json({
      success: true,
      data: {
        daily_progress: result.data
      },
      message: 'Daily progress saved successfully'
    });

  } catch (error) {
    console.error('❌ Daily progress save error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save daily progress'
    });
  }
});

// Get specific day progress
router.get('/:internship_id/:day_number', async (req, res) => {
  try {
    const userId = req.user.id;
    const { internship_id, day_number } = req.params;

    console.log('📊 Getting day progress:', { internship_id, day_number });

    const { data, error } = await req.supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('internship_id', internship_id)
      .eq('day_number', parseInt(day_number))
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Day progress fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch day progress'
      });
    }

    res.json({
      success: true,
      data: {
        daily_progress: data || null
      }
    });

  } catch (error) {
    console.error('❌ Day progress fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch day progress'
    });
  }
});

module.exports = router;