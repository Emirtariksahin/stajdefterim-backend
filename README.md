# 🔧 StajDefterim Backend API

StajDefterim uygulamasının backend API'si. Node.js, Express.js ve Supabase kullanılarak geliştirilmiş modern REST API.

## 🚀 Özellikler

### 🔐 Kimlik Doğrulama & Güvenlik
- **JWT Token Authentication**: Güvenli kullanıcı oturum yönetimi
- **Rate Limiting**: API saldırılarına karşı koruma (15 dakikada 1000 istek)
- **Helmet**: HTTP güvenlik başlıkları
- **CORS**: Cross-origin kaynak paylaşımı kontrolü
- **Input Validation**: Girdi doğrulama ve sanitizasyon

### 📊 Veri Yönetimi
- **Supabase Integration**: PostgreSQL veritabanı ile entegrasyon
- **Real-time Updates**: Canlı veri güncellemeleri
- **Row Level Security**: Veritabanı seviyesinde güvenlik
- **Migration System**: Veritabanı şema yönetimi

### 📧 E-posta Servisleri
- **Automated Emails**: Zamanlanmış e-posta gönderimi
- **Template System**: HTML formatında şablon e-postalar
- **SMTP Integration**: Gmail, Outlook vb. e-posta sağlayıcıları
- **Notification System**: Bildirim ve hatırlatıcı e-postaları

### 🔄 Zamanlanmış Görevler
- **Cron Jobs**: Otomatik e-posta gönderimi
- **Daily Reminders**: Günlük hatırlatıcılar
- **Task Notifications**: Görev tamamlama bildirimleri

## 🛠️ Teknoloji Stack

### Core Technologies
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Supabase**: Backend-as-a-Service (PostgreSQL)

### Security & Middleware
- **JWT**: JSON Web Token authentication
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logging
- **Rate Limiting**: API protection

### Database & ORM
- **PostgreSQL**: Primary database (via Supabase)
- **Supabase Client**: Database client library
- **Row Level Security**: Database-level security

### Email & Scheduling
- **Nodemailer**: E-mail sending
- **Node-cron**: Cron job scheduling
- **SMTP**: E-mail transport

## 📁 Proje Yapısı

```
backend/
├── 📁 config/                 # Yapılandırma dosyaları
│   └── index.js              # Ana config dosyası
├── 📁 middleware/             # Express middleware'leri
│   └── auth.js               # Kimlik doğrulama middleware'i
├── 📁 migrations/             # Veritabanı migration'ları
│   ├── create_daily_progress.sql
│   ├── create_notifications_system.sql
│   ├── add_avatar_to_users.sql
│   └── ...
├── 📁 routes/                 # API endpoint'leri
│   ├── auth.js               # Kimlik doğrulama rotaları
│   ├── internships.js        # Staj yönetimi
│   ├── tasks.js              # Görev yönetimi
│   ├── notes.js              # Not yönetimi
│   ├── daily-progress.js     # Günlük ilerleme
│   ├── voice-notes.js        # Sesli notlar
│   └── reminders.js          # Hatırlatıcılar
├── 📁 services/               # İş mantığı servisleri
│   ├── emailService.js       # E-posta servisi
│   └── scheduledEmailService.js # Zamanlanmış e-postalar
├── 📄 server.js               # Ana sunucu dosyası
├── 📄 config.js               # Yapılandırma
├── 📄 package.json            # Bağımlılıklar
├── 📄 vercel.json             # Vercel deployment
└── 📄 .env                    # Environment variables
```

## 🚀 Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Supabase hesabı ve projesi
- SMTP e-posta sağlayıcısı (Gmail, Outlook vb.)

### Environment Variables

`.env` dosyası oluşturun:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3002
NODE_ENV=development

# Frontend URL (Production)
FRONTEND_URL=https://your-frontend-domain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=StajDefterim <your-email@gmail.com>
```

### Kurulum Adımları

```bash
# Bağımlılıkları yükle
npm install

# Development sunucusunu başlat
npm run dev

# Production sunucusunu başlat
npm start
```

## 📡 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/register     # Kullanıcı kaydı
POST   /api/auth/login        # Kullanıcı girişi
GET    /api/auth/profile      # Profil bilgileri
PUT    /api/auth/profile      # Profil güncelleme
```

### 🏢 Internships
```
GET    /api/internships      # Staj listesi
POST   /api/internships      # Yeni staj oluşturma
PUT    /api/internships/:id  # Staj güncelleme
DELETE /api/internships/:id  # Staj silme
```

### ✅ Tasks
```
GET    /api/tasks            # Görev listesi
POST   /api/tasks            # Yeni görev oluşturma
PUT    /api/tasks/:id        # Görev güncelleme
DELETE /api/tasks/:id        # Görev silme
```

### 📝 Notes
```
GET    /api/notes            # Not listesi
POST   /api/notes            # Yeni not oluşturma
PUT    /api/notes/:id        # Not güncelleme
DELETE /api/notes/:id        # Not silme
```

### 📊 Daily Progress
```
GET    /api/daily-progress   # Günlük ilerleme listesi
POST   /api/daily-progress   # Yeni ilerleme kaydı
PUT    /api/daily-progress/:id # İlerleme güncelleme
```

### 🎤 Voice Notes
```
GET    /api/voice-notes      # Sesli not listesi
POST   /api/voice-notes      # Yeni sesli not yükleme
DELETE /api/voice-notes/:id  # Sesli not silme
```

### 🔔 Reminders
```
GET    /api/reminders        # Hatırlatıcı listesi
POST   /api/reminders        # Yeni hatırlatıcı oluşturma
PUT    /api/reminders/:id    # Hatırlatıcı güncelleme
DELETE /api/reminders/:id    # Hatırlatıcı silme
```

### 🏥 Health Check
```
GET    /health               # API durumu
GET    /                     # API bilgileri ve endpoint listesi
```

## 🔐 Authentication

### JWT Token Format
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

### Protected Routes
Tüm korumalı endpoint'ler için `Authorization` header'ında JWT token gönderilmelidir:

```
Authorization: Bearer <your-jwt-token>
```

## 📧 E-posta Sistemi

### Otomatik E-postalar
- **Günlük Sabah Hatırlatıcısı**: 08:00'da gönderilir
- **Günlük Akşam Hatırlatıcısı**: 18:00'da gönderilir
- **Görev Tamamlama**: Görev tamamlandığında
- **Özel Hatırlatıcılar**: Kullanıcı tanımlı zamanlarda

### E-posta Şablonları
- HTML formatında responsive tasarım
- StajDefterim branding
- Kişiselleştirilmiş içerik
- Call-to-action butonları

## 🗄️ Veritabanı Şeması

### Ana Tablolar

#### users
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password_hash`: String
- `first_name`: String
- `last_name`: String
- `avatar_url`: String (Nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### internships
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `company_name`: String
- `position`: String
- `start_date`: Date
- `end_date`: Date (Nullable)
- `description`: Text
- `goals`: Text[]

#### tasks
- `id`: UUID (Primary Key)
- `internship_id`: UUID (Foreign Key)
- `title`: String
- `description`: Text
- `status`: Enum ('pending', 'in_progress', 'completed')
- `priority`: Enum ('low', 'medium', 'high')
- `due_date`: Date (Nullable)
- `completed_at`: Timestamp (Nullable)

#### daily_progress
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `date`: Date
- `activities`: Text[]
- `learnings`: Text[]
- `challenges`: Text[]
- `mood`: Enum ('excellent', 'good', 'neutral', 'bad', 'terrible')

#### notes
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `title`: String
- `content`: Text
- `type`: Enum ('text', 'voice')
- `file_url`: String (Nullable)
- `created_at`: Timestamp

#### reminders
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `title`: String
- `description`: Text
- `reminder_date`: Timestamp
- `is_sent`: Boolean
- `email_sent`: Boolean
- `created_at`: Timestamp

## 🔒 Güvenlik

### Rate Limiting
- **Window**: 15 dakika
- **Max Requests**: 1000 istek per IP
- **Headers**: Standard rate limit headers

### CORS Policy
```javascript
// Development
origin: ['http://localhost:8081', 'http://localhost:19006', '*']

// Production
origin: ['https://your-frontend-domain.com', 'https://stajdefterim.com']
```

### JWT Security
- **Algorithm**: HS256
- **Expiration**: 7 gün
- **Secret**: Environment variable'dan alınır
- **Refresh**: Otomatik token yenileme

## 🚀 Deployment

### Vercel (Production)
```bash
# Vercel CLI kurulumu
npm i -g vercel

# Deploy
vercel --prod

# Environment variables ayarlama
vercel env add SUPABASE_URL
vercel env add JWT_SECRET
# ... diğer environment variables
```

### Local Development
```bash
# Development sunucusu
npm run dev

# Production build
npm run build

# Production sunucusu
npm start
```

## 📊 Monitoring & Logging

### Health Check
```bash
GET /health
Response: {
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Logging
- **Morgan**: HTTP request logging
- **Console**: Error logging
- **Structured**: JSON format logging

### Error Handling
```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});
```

## 🧪 Testing

### Test Komutları
```bash
# Test çalıştırma
npm test

# Linting
npm run lint

# Type checking (TypeScript varsa)
npx tsc --noEmit
```

### API Testing
- **Postman Collection**: API endpoint'leri için
- **Insomnia**: REST client
- **Thunder Client**: VS Code extension

## 🔧 Development

### Scripts
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "build": "echo 'Build completed'",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

### Code Standards
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **Conventional Commits**: Git commit messages
- **JSDoc**: API documentation

### Git Workflow
1. Feature branch oluştur
2. Değişiklikleri commit et
3. Pull request oluştur
4. Code review
5. Merge to main

## 📚 API Documentation

### Request/Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Pagination
```javascript
// Query Parameters
GET /api/tasks?page=1&limit=10&sort=created_at&order=desc

// Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### File Upload
```javascript
// Voice Notes
POST /api/voice-notes
Content-Type: multipart/form-data

// Request Body
{
  "title": "Meeting Notes",
  "description": "Daily standup meeting",
  "audio_file": <file>
}
```

## 🤝 Katkıda Bulunma

1. **Fork** yapın
2. **Feature branch** oluşturun (`git checkout -b feature/AmazingFeature`)
3. **Commit** yapın (`git commit -m 'Add some AmazingFeature'`)
4. **Push** yapın (`git push origin feature/AmazingFeature`)
5. **Pull Request** oluşturun

### Development Guidelines
- Kod standartlarına uyun
- Test yazın
- Documentation güncelleyin
- Conventional commits kullanın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Geliştirici

- **Backend**: Node.js, Express, Supabase
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Email**: Nodemailer, SMTP
- **Deployment**: Vercel

## 📞 İletişim

Proje hakkında sorularınız için:
- **GitHub Issues**: [Backend Repository](https://github.com/Emirtariksahin/stajdefterim)
- **Email**: emirtariik@gmail.com

## 🔄 Güncellemeler

### v1.0.0
- İlk sürüm
- Temel CRUD operasyonları
- JWT authentication
- E-posta sistemi
- Vercel deployment

---

**StajDefterim Backend API** ile güçlü ve güvenli backend servisleri! 🚀
