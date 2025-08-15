const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');
const router = express.Router();

router.use(authenticateToken);

// Get all reminders for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { internship_id, active_only = 'true', upcoming_only = 'false' } = req.query;

    let query = req.supabase
      .from('reminders')
      .select(`
        *,
        internships (
          company_name,
          department
        )
      `)
      .eq('user_id', userId);

    // Filter by internship if provided
    if (internship_id) {
      query = query.eq('internship_id', internship_id);
    }

    // Filter active reminders only
    if (active_only === 'true') {
      query = query.eq('is_active', true);
    }

    // Filter upcoming reminders only (next 7 days)
    if (upcoming_only === 'true') {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      
      query = query
        .gte('reminder_date', now.toISOString())
        .lte('reminder_date', nextWeek.toISOString());
    }

    const { data, error } = await query.order('reminder_date', { ascending: true });

    if (error) {
      console.error('Reminders fetch error:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch reminders' });
    }

    res.json({ success: true, data: { reminders: data || [] } });
  } catch (error) {
    console.error('Reminders fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reminders' });
  }
});

// Get upcoming reminders (next 7 days)
router.get('/upcoming', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const { data, error } = await req.supabase
      .from('reminders')
      .select(`
        *,
        internships (
          company_name,
          department
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('reminder_date', now.toISOString())
      .lte('reminder_date', nextWeek.toISOString())
      .order('reminder_date', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Upcoming reminders fetch error:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch upcoming reminders' });
    }

    res.json({ success: true, data: { reminders: data || [] } });
  } catch (error) {
    console.error('Upcoming reminders fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch upcoming reminders' });
  }
});

// Get notification settings (BEFORE /:id routes)
router.get('/settings', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await req.supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Notification settings fetch error:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch notification settings' });
    }

    // If no settings found, create default ones
    if (!data) {
      const { data: newSettings, error: createError } = await req.supabase
        .from('notification_settings')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) {
        console.error('Default notification settings creation error:', createError);
        return res.status(500).json({ success: false, error: 'Failed to create notification settings' });
      }

      return res.json({ success: true, data: { settings: newSettings } });
    }

    res.json({ success: true, data: { settings: data } });
  } catch (error) {
    console.error('Notification settings fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification settings' });
  }
});

// Update notification settings (BEFORE /:id routes)
router.put('/settings', async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    console.log('Updating notification settings for user:', userId);
    console.log('Updates:', updates);

    // Remove user_id from updates to prevent modification
    delete updates.user_id;

    // First, check if settings exist
    const { data: existingSettings } = await req.supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    let data, error;

    if (existingSettings) {
      // Update existing settings
      ({ data, error } = await req.supabase
        .from('notification_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single());
    } else {
      // Insert new settings
      ({ data, error } = await req.supabase
        .from('notification_settings')
        .insert({
          user_id: userId,
          ...updates
        })
        .select()
        .single());
    }

    if (error) {
      console.error('Notification settings update error:', error);
      return res.status(500).json({ success: false, error: 'Failed to update notification settings' });
    }

    console.log('Notification settings updated successfully:', data);
    res.json({ success: true, data: { settings: data } });
  } catch (error) {
    console.error('Notification settings update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification settings' });
  }
});

// Create new reminder
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      internship_id,
      title,
      description,
      reminder_type = 'custom',
      reminder_date,
      is_recurring = false,
      recurrence_pattern,
      priority = 'medium',
      notification_time = '09:00:00'
    } = req.body;

    if (!title || !reminder_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and reminder date are required' 
      });
    }

    // Debug log
    console.log('Creating reminder with user_id:', userId);
    console.log('Reminder data:', {
      user_id: userId,
      internship_id,
      title,
      description,
      reminder_type,
      reminder_date,
      is_recurring,
      recurrence_pattern,
      priority,
      notification_time,
    });

    const { data, error } = await req.supabase
      .from('reminders')
      .insert({
        user_id: userId,
        internship_id,
        title,
        description,
        reminder_type,
        reminder_date,
        is_recurring,
        recurrence_pattern,
        priority,
        notification_time,
      })
      .select()
      .single();

    if (error) {
      console.error('Reminder creation error:', error);
      return res.status(500).json({ success: false, error: 'Failed to create reminder' });
    }

    res.status(201).json({ success: true, data: { reminder: data } });
  } catch (error) {
    console.error('Reminder creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create reminder' });
  }
});

// Update reminder
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Remove user_id from updates to prevent modification
    delete updates.user_id;

    const { data, error } = await req.supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns the reminder
      .select()
      .single();

    if (error) {
      console.error('Reminder update error:', error);
      return res.status(500).json({ success: false, error: 'Failed to update reminder' });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    res.json({ success: true, data: { reminder: data } });
  } catch (error) {
    console.error('Reminder update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update reminder' });
  }
});

// Mark reminder as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('reminders')
      .update({ is_completed: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Reminder completion error:', error);
      return res.status(500).json({ success: false, error: 'Failed to complete reminder' });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    res.json({ success: true, data: { reminder: data } });
  } catch (error) {
    console.error('Reminder completion error:', error);
    res.status(500).json({ success: false, error: 'Failed to complete reminder' });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await req.supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Reminder deletion error:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete reminder' });
    }

    res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Reminder deletion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete reminder' });
  }
});

// Email notification endpoints

// Send test email
router.post('/email/test', async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.user;

    if (!email) {
      return res.status(400).json({ success: false, error: 'User email not found' });
    }

    console.log(`🧪 Sending test email to: ${email}`);
    
    const result = await emailService.sendTestEmail(email, {
      name: req.user.name || 'Kullanıcı',
      email: email
    });

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test e-postası başarıyla gönderildi',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Test e-postası gönderilemedi' 
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, error: 'Test e-postası gönderilemedi' });
  }
});

// Send reminder email
router.post('/email/reminder/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.user;
    const { id } = req.params;

    if (!email) {
      return res.status(400).json({ success: false, error: 'User email not found' });
    }

    // Get reminder details
    const { data: reminder, error } = await req.supabase
      .from('reminders')
      .select(`
        *,
        internships (
          company_name,
          department
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    console.log(`📧 Sending reminder email for: ${reminder.title}`);
    
    const result = await emailService.sendReminderEmail(email, {
      title: reminder.title,
      description: reminder.description,
      reminder_date: reminder.reminder_date,
      internship: reminder.internships ? {
        company_name: reminder.internships.company_name,
        department: reminder.internships.department
      } : null
    });

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Hatırlatıcı e-postası başarıyla gönderildi',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Hatırlatıcı e-postası gönderilemedi' 
      });
    }
  } catch (error) {
    console.error('Reminder email error:', error);
    res.status(500).json({ success: false, error: 'Hatırlatıcı e-postası gönderilemedi' });
  }
});

// Send task deadline email
router.post('/email/task-deadline', async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.user;
    const { taskId, message } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'User email not found' });
    }

    if (!taskId) {
      return res.status(400).json({ success: false, error: 'Task ID is required' });
    }

    // Get task details
    const { data: task, error } = await req.supabase
      .from('tasks')
      .select(`
        *,
        internships (
          company_name,
          department
        )
      `)
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (error || !task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    console.log(`⚡ Sending task deadline email for: ${task.title}`);
    
    const result = await emailService.sendTaskDeadlineEmail(email, {
      task: {
        title: task.title,
        description: task.description,
        end_date: task.end_date,
        priority: task.priority
      },
      message: message || 'Görev teslim tarihi yaklaşıyor!',
      internship: task.internships ? {
        company_name: task.internships.company_name,
        department: task.internships.department
      } : null
    });

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Görev deadline e-postası başarıyla gönderildi',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Görev deadline e-postası gönderilemedi' 
      });
    }
  } catch (error) {
    console.error('Task deadline email error:', error);
    res.status(500).json({ success: false, error: 'Görev deadline e-postası gönderilemedi' });
  }
});

// Send daily summary email
router.post('/email/daily-summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.user;
    const { internshipId, dayNumber } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'User email not found' });
    }

    if (!internshipId) {
      return res.status(400).json({ success: false, error: 'Internship ID is required' });
    }

    // Get internship details
    const { data: internship, error: internshipError } = await req.supabase
      .from('internships')
      .select('*')
      .eq('id', internshipId)
      .eq('user_id', userId)
      .single();

    if (internshipError || !internship) {
      return res.status(404).json({ success: false, error: 'Internship not found' });
    }

    // Get today's progress and notes
    const today = new Date().toISOString().split('T')[0];
    
    const [dailyProgressResult, notesResult, tasksResult] = await Promise.all([
      req.supabase
        .from('daily_progress')
        .select('*')
        .eq('internship_id', internshipId)
        .eq('user_id', userId)
        .gte('created_at', today),
      
      req.supabase
        .from('notes')
        .select('*')
        .eq('internship_id', internshipId)
        .eq('user_id', userId)
        .gte('created_at', today),
      
      req.supabase
        .from('tasks')
        .select('*')
        .eq('internship_id', internshipId)
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('updated_at', today)
    ]);

    const dailyProgress = dailyProgressResult.data || [];
    const todayNotes = notesResult.data || [];
    const completedTasks = tasksResult.data || [];
    
    const earnedExp = dailyProgress.reduce((sum, p) => sum + (p.earned_exp || 0), 0);

    console.log(`📊 Sending daily summary email for: ${internship.company_name}`);
    
    const result = await emailService.sendDailySummaryEmail(email, {
      internship: {
        company_name: internship.company_name,
        department: internship.department
      },
      dayNumber: dayNumber || 'N/A',
      completedTasks: completedTasks.length,
      totalNotes: todayNotes.length,
      earnedExp: earnedExp,
      todayNotes: todayNotes.slice(0, 3) // Son 3 notu göster
    });

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Günlük özet e-postası başarıyla gönderildi',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Günlük özet e-postası gönderilemedi' 
      });
    }
  } catch (error) {
    console.error('Daily summary email error:', error);
    res.status(500).json({ success: false, error: 'Günlük özet e-postası gönderilemedi' });
  }
});

// Check email service status
router.get('/email/status', async (req, res) => {
  try {
    const result = await emailService.verifyConnection();
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'E-posta servisi aktif',
        status: 'connected'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error,
        status: 'disconnected'
      });
    }
  } catch (error) {
    console.error('Email status check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'E-posta servisi durumu kontrol edilemedi',
      status: 'unknown'
    });
  }
});

module.exports = router;


