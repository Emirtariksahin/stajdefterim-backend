const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    console.log('📧 Attempting to register user:', { name, email: email.toLowerCase(), password: '***' });

    // Register user with Supabase Auth
    const { data, error } = await req.supabase.auth.signUp({
      email: email.toLowerCase().trim(), // Email'i normalize et
      password,
      options: {
        emailConfirm: false, // Mail doğrulamasını kapat
        data: {
          name,
          login_method: 'email'
        }
      }
    });

    if (error) {
      console.error('🚨 Supabase registration error:', {
        message: error.message,
        status: error.status,
        details: error
      });
      
      // Daha kullanıcı dostu hata mesajları
      let errorMessage = error.message;
      if (error.message.includes('User already registered')) {
        errorMessage = 'Bu email adresi zaten kayıtlı. Giriş yapmayı deneyin.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Geçersiz email adresi. Lütfen gerçek bir email adresi kullanın.';
      } else if (error.message.includes('invalid') && error.message.includes('email')) {
        errorMessage = 'Bu email adresi geçersiz. Lütfen mevcut bir email adresi kullanın.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalı.';
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: 'Registration failed'
      });
    }

    // Get the created user profile
    const { data: profile, error: profileError } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || name,
          login_method: profile?.login_method || 'email',
          created_at: profile?.created_at || data.user.created_at
        },
        token: data.session?.access_token,
        message: 'User registered successfully'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
   console.log("test:",req);
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Sign in with Supabase Auth
    const { data, error } = await req.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('🚨 Supabase login error:', {
        message: error.message,
        status: error.status,
        details: error
      });
      
      // Daha kullanıcı dostu hata mesajları
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email veya şifre hatalı.';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Çok fazla deneme. Lütfen bir süre bekleyin.';
      }
      
      return res.status(401).json({
        success: false,
        error: errorMessage
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({
        success: false,
        error: 'Login failed'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.user_metadata?.name,
          login_method: profile?.login_method || 'email',
          created_at: profile?.created_at || data.user.created_at
        },
        token: data.session.access_token,
        message: 'Login successful'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
    }

    const { data, error } = await req.supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }

    res.json({
      success: true,
      data: {
        user: data,
        message: 'Profile updated successfully'
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Verify token
router.get('/verify', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      user: req.user
    }
  });
});

module.exports = router;