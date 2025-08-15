const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks for the user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { internship_id } = req.query;

    let query = req.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (internship_id) {
      query = query.eq('internship_id', internship_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Tasks fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch tasks'
      });
    }

    res.json({
      success: true,
      data: {
        tasks: data || []
      }
    });

  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    });
  }
});

// Get task statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const { internship_id } = req.query;

    let query = req.supabase
      .from('tasks')
      .select('completed, priority')
      .eq('user_id', userId);

    if (internship_id) {
      query = query.eq('internship_id', internship_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Task stats fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch task statistics'
      });
    }

    const stats = {
      total: data.length,
      completed: data.filter(task => task.completed).length,
      pending: data.filter(task => !task.completed).length,
      by_priority: {
        acil: data.filter(task => task.priority === 'acil').length,
        onemli: data.filter(task => task.priority === 'onemli').length,
        orta: data.filter(task => task.priority === 'orta').length,
        dusuk: data.filter(task => task.priority === 'dusuk').length
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Task stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task statistics'
    });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      priority,
      start_date,
      end_date,
      internship_id
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      });
    }

    // Validate priority
    const validPriorities = ['acil', 'onemli', 'orta', 'dusuk'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority. Must be one of: acil, onemli, orta, dusuk'
      });
    }

    const taskData = {
      user_id: userId,
      title,
      description: description || null,
      priority: priority || 'orta',
      start_date: start_date || null,
      end_date: end_date || null,
      internship_id: internship_id || null,
      completed: false
    };

    const { data, error } = await req.supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Task creation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create task'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        task: data,
        message: 'Task created successfully'
      }
    });

  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const {
      title,
      description,
      priority,
      completed,
      start_date,
      end_date
    } = req.body;

    // Build update object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) {
      const validPriorities = ['acil', 'onemli', 'orta', 'dusuk'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid priority. Must be one of: acil, onemli, orta, dusuk'
        });
      }
      updateData.priority = priority;
    }
    if (completed !== undefined) updateData.completed = completed;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
    }

    const { data, error } = await req.supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Task update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update task'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: {
        task: data,
        message: 'Task updated successfully'
      }
    });

  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const { error } = await req.supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.error('Task deletion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete task'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Task deleted successfully'
      }
    });

  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

module.exports = router;