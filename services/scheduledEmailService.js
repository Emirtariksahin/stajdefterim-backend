const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const emailService = require('./emailService');

// Initialize Supabase client with anon key (RLS must be disabled for users table)
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

class ScheduledEmailService {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
  }

  // Zamanlanmış e-posta servisini başlat
  start() {
    if (this.isRunning) {
      console.log('📧 Scheduled email service is already running');
      return;
    }

    // Her dakika kontrol et (cron: '* * * * *')
    // Production'da her 5 dakikada bir yapmak daha iyi olabilir: '*/5 * * * *'
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.checkAndSendScheduledEmails();
    }, {
      scheduled: false, // Manuel olarak başlatacağız
      timezone: 'Europe/Istanbul'
    });

    this.cronJob.start();
    this.isRunning = true;
    console.log('✅ Scheduled email service started - checking every minute');
  }

  // Zamanlanmış e-posta servisini durdur
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('🛑 Scheduled email service stopped');
  }

  // Zamanlanmış e-postaları kontrol et ve gönder
  async checkAndSendScheduledEmails() {
    try {
      console.log('🔍 Checking for scheduled reminder emails...');

      // İlk önce reminders tablosundaki verileri kontrol et
      const { data: sampleReminders } = await supabase
        .from('reminders')
        .select('id, title, user_id')
        .limit(2);
      
      console.log('📋 Sample reminder data:', sampleReminders);

      // Users tablosundaki verileri de kontrol et
      const { data: sampleUsers } = await supabase
        .from('users')
        .select('id, email, name')
        .limit(2);
      
      console.log('👥 Sample user data:', sampleUsers);

      // Şu anki zamanı al (Türkiye saati)
      const now = new Date();
      const currentTime = now.toISOString();
      
      // Gönderilmesi gereken hatırlatıcıları bul
      // reminder_date <= şu an && is_active = true && email_sent != true
      const { data: reminders, error } = await supabase
        .from('reminders')
        .select('*')
        .lte('reminder_date', currentTime)
        .eq('is_active', true)
        .eq('is_completed', false)
        .is('email_sent', false); // E-posta henüz gönderilmemiş

      if (error) {
        console.error('❌ Error fetching scheduled reminders:', error);
        return;
      }

      if (!reminders || reminders.length === 0) {
        console.log('📭 No scheduled emails to send');
        return;
      }

      console.log(`📬 Found ${reminders.length} reminders to send emails for`);

      // Her hatırlatıcı için e-posta gönder
      for (const reminder of reminders) {
        await this.sendReminderEmail(reminder);
      }

    } catch (error) {
      console.error('❌ Error in checkAndSendScheduledEmails:', error);
    }
  }

  // Hatırlatıcı e-postası gönder
  async sendReminderEmail(reminder) {
    try {
      // Debug: reminder bilgilerini logla
      console.log(`🔍 Processing reminder: ${reminder.title}, user_id: ${reminder.user_id}`);

      // Kullanıcı bilgilerini çek
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', reminder.user_id);

      console.log(`👤 User query result:`, { users, userError, user_id: reminder.user_id });

      if (userError || !users || users.length === 0) {
        console.warn(`⚠️ No user found for reminder: ${reminder.title}`, userError);
        return;
      }

      const user = users[0];

      // Kullanıcının bildirim ayarlarını kontrol et
      const { data: settings, error: settingsError } = await supabase
        .from('notification_settings')
        .select('email_notifications, push_notifications, daily_reminders, weekly_reports, task_deadlines')
        .eq('user_id', reminder.user_id);

      console.log(`🔍 Settings query result:`, { settings, settingsError, user_id: reminder.user_id });

      if (settingsError || !settings || settings.length === 0) {
        console.warn(`⚠️ No notification settings found for user: ${reminder.user_id}`, settingsError);
        return;
      }

      const userSettings = settings[0];
      console.log(`⚙️ User notification settings:`, userSettings);

      // E-posta bildirimleri kapalıysa e-posta gönderme
      if (!userSettings.email_notifications) {
        console.log(`📧 ❌ Email notifications DISABLED for user: ${user.email} - SKIPPING EMAIL`);
        return;
      }

      console.log(`📧 ✅ Email notifications ENABLED for user: ${user.email} - SENDING EMAIL`);

      // Hatırlatıcı tipine göre kontrol et
      if (reminder.reminder_type === 'daily' && !userSettings.daily_reminders) {
        console.log(`📅 Daily reminders disabled for user: ${user.email}`);
        return;
      }

      if (reminder.reminder_type === 'weekly' && !userSettings.weekly_reports) {
        console.log(`📊 Weekly reports disabled for user: ${user.email}`);
        return;
      }

      if (reminder.reminder_type === 'task_deadline' && !userSettings.task_deadlines) {
        console.log(`📋 Task deadlines disabled for user: ${user.email}`);
        return;
      }

      // Internship bilgilerini çek (varsa)
      let internship = null;
      if (reminder.internship_id) {
        const { data: internships, error: internshipError } = await supabase
          .from('internships')
          .select('company_name, department')
          .eq('id', reminder.internship_id);

        if (!internshipError && internships && internships.length > 0) {
          internship = internships[0];
        }
      }

      const userEmail = user.email;
      const userName = user.name || 'Kullanıcı';

      if (!userEmail) {
        console.warn(`⚠️ No email found for reminder: ${reminder.title}`);
        return;
      }

      // E-posta gönder
      const reminderData = {
        title: reminder.title,
        description: reminder.description || '',
        reminder_date: reminder.reminder_date,
        priority: reminder.priority,
        internship: internship
      };
      
      console.log(`📧 Debug - About to send email with data:`, reminderData);
      const emailResult = await emailService.sendReminderEmail(userEmail, reminderData);

      if (emailResult.success) {
        // E-posta başarıyla gönderildi, reminder'ı güncelle
        const { error: updateError } = await supabase
          .from('reminders')
          .update({ 
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('id', reminder.id);

        if (updateError) {
          console.error(`❌ Error updating reminder ${reminder.id}:`, updateError);
        } else {
          console.log(`✅ Scheduled email sent for reminder: ${reminder.title} to ${userEmail}`);
        }
      } else {
        console.error(`❌ Failed to send scheduled email for reminder: ${reminder.title}`, emailResult.error);
      }

    } catch (error) {
      console.error(`❌ Error sending scheduled email for reminder ${reminder.id}:`, error);
    }
  }

  // Servis durumunu kontrol et
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.cronJob ? this.cronJob.nextDate()?.toISOString() : null
    };
  }
}

// Singleton instance
const scheduledEmailService = new ScheduledEmailService();

module.exports = scheduledEmailService;
