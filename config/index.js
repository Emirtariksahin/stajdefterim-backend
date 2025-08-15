require('dotenv').config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Database
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS
  ALLOWED_ORIGINS: [
    'http://localhost:19006',
    'http://localhost:8081',
    'exp://localhost:8081',
    'exp://192.168.1.100:8081',
    'https://37f56d2d497f.ngrok-free.app'
  ]
};

// Validate required config
const requiredConfig = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
for (const key of requiredConfig) {
  if (!config[key]) {
    console.error(`❌ Missing required config: ${key}`);
    process.exit(1);
  }
}

module.exports = config;