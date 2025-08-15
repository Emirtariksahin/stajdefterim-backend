// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zuxwqlsymswmwijneoqg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eHdxbHN5bXN3bXdpam5lb3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTE4NTIsImV4cCI6MjA2OTk2Nzg1Mn0.XqKb43xM3bgqjtjV6qKXX1NkOiv5XGWZfjTwyGkeOWc';
// Service role key for backend operations (bypasses RLS)
// TODO: Replace with your actual service_role key from Supabase Dashboard
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

// Server Configuration
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS Configuration - Production'da sadece gerekli origin'lere izin ver
const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production' 
  ? [
      'https://your-frontend-domain.com', // Frontend domain'inizi buraya ekleyin
      'https://stajdefterim.com', // Eğer custom domain kullanıyorsanız
      process.env.FRONTEND_URL // Environment variable'dan da alabilirsiniz
    ].filter(Boolean) // Boş değerleri filtrele
  : [
      'http://localhost:8081',
      'http://localhost:19006',
      'http://172.25.25.145:8081',
      'http://192.168.56.1:8081',
      'http://10.0.2.2:8081',
      'exp://172.25.25.145:8081',
      'exp://192.168.56.1:8081',
      'exp://10.0.2.2:8081',
      '*' // Development için tüm origin'lere izin ver
    ];

// Email Configuration
const EMAIL_CONFIG = {
  service: 'gmail', // Gmail, Outlook, Yahoo vs.
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // E-posta adresin
    pass: process.env.EMAIL_PASS || 'your-app-password' // Gmail App Password
  },
  from: process.env.EMAIL_FROM || 'StajDefterim <your-email@gmail.com>'
};

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  PORT,
  NODE_ENV,
  ALLOWED_ORIGINS,
  EMAIL_CONFIG
};