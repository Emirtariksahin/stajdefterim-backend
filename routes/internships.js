const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all internships for the user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await req.supabase
      .from('internships')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Internships fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch internships'
      });
    }

    res.json({
      success: true,
      data: {
        internships: data || []
      }
    });

  } catch (error) {
    console.error('Internships fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch internships'
    });
  }
});

// Get active internship
router.get('/active', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await req.supabase
      .from('internships')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Active internship fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch active internship'
      });
    }

    res.json({
      success: true,
      data: {
        internship: data || null
      }
    });

  } catch (error) {
    console.error('Active internship fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active internship'
    });
  }
});

// Set active internship (deactivate others, activate selected one)
router.put('/set-active/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const internshipId = req.params.id;

    console.log('🔄 Setting active internship:', { userId, internshipId });

    // First, deactivate all internships for this user
    const { error: deactivateError } = await req.supabase
      .from('internships')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.error('❌ Error deactivating internships:', deactivateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to deactivate existing internships'
      });
    }

    // Then, activate the selected internship
    const { data, error: activateError } = await req.supabase
      .from('internships')
      .update({ is_active: true })
      .eq('id', internshipId)
      .eq('user_id', userId) // Security: ensure user owns this internship
      .select()
      .single();

    if (activateError) {
      console.error('❌ Error activating internship:', activateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to activate selected internship'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found or access denied'
      });
    }

    console.log('✅ Successfully set active internship:', data.company_name);

    res.json({
      success: true,
      data: {
        internship: data
      },
      message: 'Active internship updated successfully'
    });

  } catch (error) {
    console.error('❌ Set active internship error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set active internship'
    });
  }
});

// Create new internship
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      company_name,
      department,
      start_date,
      end_date,
      supervisor_name,
      supervisor_email,
      description
    } = req.body;

    // Validate required fields
    if (!company_name || !department) {
      return res.status(400).json({
        success: false,
        error: 'Company name and department are required'
      });
    }

    // Deactivate other internships if this one is being set as active
    await req.supabase
      .from('internships')
      .update({ is_active: false })
      .eq('user_id', userId);

    const internshipData = {
      user_id: userId,
      company_name,
      department,
      start_date: start_date || null,
      end_date: end_date || null,
      supervisor_name: supervisor_name || null,
      supervisor_email: supervisor_email || null,
      description: description || null,
      is_active: true
    };

    const { data, error } = await req.supabase
      .from('internships')
      .insert(internshipData)
      .select()
      .single();

    if (error) {
      console.error('Internship creation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create internship'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        internship: data,
        message: 'Internship created successfully'
      }
    });

  } catch (error) {
    console.error('Internship creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create internship'
    });
  }
});

// Update internship
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const internshipId = req.params.id;
    const {
      company_name,
      department,
      start_date,
      end_date,
      supervisor_name,
      supervisor_email,
      description,
      is_active
    } = req.body;

    // Build update object
    const updateData = {};
    if (company_name !== undefined) updateData.company_name = company_name;
    if (department !== undefined) updateData.department = department;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (supervisor_name !== undefined) updateData.supervisor_name = supervisor_name;
    if (supervisor_email !== undefined) updateData.supervisor_email = supervisor_email;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
    }

    // If setting this internship as active, deactivate others
    if (updateData.is_active === true) {
      await req.supabase
        .from('internships')
        .update({ is_active: false })
        .eq('user_id', userId)
        .neq('id', internshipId);
    }

    const { data, error } = await req.supabase
      .from('internships')
      .update(updateData)
      .eq('id', internshipId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Internship update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update internship'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    res.json({
      success: true,
      data: {
        internship: data,
        message: 'Internship updated successfully'
      }
    });

  } catch (error) {
    console.error('Internship update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update internship'
    });
  }
});

// Delete internship
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const internshipId = req.params.id;

    const { error } = await req.supabase
      .from('internships')
      .delete()
      .eq('id', internshipId)
      .eq('user_id', userId);

    if (error) {
      console.error('Internship deletion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete internship'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Internship deleted successfully'
      }
    });

  } catch (error) {
    console.error('Internship deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete internship'
    });
  }
});

module.exports = router;