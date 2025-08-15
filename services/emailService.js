const nodemailer = require('nodemailer');
const config = require('../config');

// E-posta transporter'ı oluştur
const transporter = nodemailer.createTransport(config.EMAIL_CONFIG);

// E-posta template'leri
const emailTemplates = {
  // Hatırlatıcı e-postası
  reminder: (data) => ({
    subject: `🔔 Hatırlatıcı: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">📋 StajDefterim</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Hatırlatıcı Bildirimi</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0; font-size: 22px;">🔔 ${data.title}</h2>
          ${data.description ? `<p style="color: #666; line-height: 1.6; font-size: 16px;">${data.description}</p>` : ''}
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #4CAF50;">
            <p style="margin: 0; color: #333;"><strong>📅 Hatırlatıcı Zamanı:</strong> ${new Date(data.reminder_date).toLocaleString('tr-TR')}</p>
            ${data.internship ? `<p style="margin: 5px 0 0 0; color: #666;"><strong>🏢 Staj:</strong> ${data.internship.company_name} - ${data.internship.department}</p>` : ''}
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="exp://stajdefterim" style="display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">📱 Uygulamayı Aç</a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 14px;">
          <p>Bu e-posta StajDefterim uygulaması tarafından otomatik olarak gönderilmiştir.</p>
          <p>Bildirim ayarlarınızı uygulama içinden değiştirebilirsiniz.</p>
        </div>
      </div>
    `
  }),

  // Görev deadline e-postası
  taskDeadline: (data) => ({
    subject: `⚡ Görev Teslim Hatırlatıcısı: ${data.task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FF9800, #F57C00); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">⚡ StajDefterim</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Görev Teslim Hatırlatıcısı</p>
        </div>
        
        <div style="background: #fff3e0; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #FF9800;">
          <h2 style="color: #333; margin-top: 0; font-size: 22px;">${data.priorityEmoji} ${data.task.title}</h2>
          ${data.task.description ? `<p style="color: #666; line-height: 1.6; font-size: 16px;">${data.task.description}</p>` : ''}
          
          <div style="margin-top: 20px;">
            <div style="display: inline-block; background: white; padding: 10px 15px; border-radius: 6px; margin: 5px; border: 2px solid #FF9800;">
              <strong style="color: #FF9800;">📅 Teslim Tarihi:</strong> ${new Date(data.task.end_date).toLocaleDateString('tr-TR')}
            </div>
            <div style="display: inline-block; background: white; padding: 10px 15px; border-radius: 6px; margin: 5px; border: 2px solid #FF9800;">
              <strong style="color: #FF9800;">🚨 Öncelik:</strong> ${data.task.priority.toUpperCase()}
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px;">
            <h3 style="color: #FF9800; margin-top: 0; font-size: 18px;">${data.message}</h3>
            ${data.internship ? `<p style="margin: 5px 0 0 0; color: #666;"><strong>🏢 Staj:</strong> ${data.internship.company_name} - ${data.internship.department}</p>` : ''}
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="exp://stajdefterim" style="display: inline-block; background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">📝 Görevi Tamamla</a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 14px;">
          <p>Bu e-posta StajDefterim uygulaması tarafından otomatik olarak gönderilmiştir.</p>
          <p>Bildirim ayarlarınızı uygulama içinden değiştirebilirsiniz.</p>
        </div>
      </div>
    `
  }),

  // Günlük özet e-postası
  dailySummary: (data) => ({
    subject: `📊 Günlük Staj Özeti - ${new Date().toLocaleDateString('tr-TR')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">📊 StajDefterim</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Günlük Staj Özeti</p>
        </div>
        
        <div style="background: #f5f5f5; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0; font-size: 22px;">🏢 ${data.internship.company_name} - ${data.internship.department}</h2>
          <p style="color: #666; margin-bottom: 20px;">📅 ${new Date().toLocaleDateString('tr-TR')} - Gün ${data.dayNumber}</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0;">
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #4CAF50;">
              <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${data.completedTasks}</div>
              <div style="color: #666; font-size: 14px;">Tamamlanan Görev</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #2196F3;">
              <div style="font-size: 24px; font-weight: bold; color: #2196F3;">${data.totalNotes}</div>
              <div style="color: #666; font-size: 14px;">Not Sayısı</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #FF9800;">
              <div style="font-size: 24px; font-weight: bold; color: #FF9800;">${data.earnedExp}</div>
              <div style="color: #666; font-size: 14px;">Kazanılan EXP</div>
            </div>
          </div>
          
          ${data.todayNotes && data.todayNotes.length > 0 ? `
            <div style="margin-top: 25px;">
              <h3 style="color: #333; margin-bottom: 15px;">📝 Bugünkü Notlar</h3>
              ${data.todayNotes.map(note => `
                <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #2196F3;">
                  <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${note.topic}</h4>
                  <p style="margin: 0; color: #666; line-height: 1.4;">${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="exp://stajdefterim" style="display: inline-block; background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">📱 Detayları Gör</a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 14px;">
          <p>Bu e-posta StajDefterim uygulaması tarafından otomatik olarak gönderilmiştir.</p>
          <p>Bildirim ayarlarınızı uygulama içinden değiştirebilirsiniz.</p>
        </div>
      </div>
    `
  }),

  // Test e-postası
  test: (data) => ({
    subject: '🧪 StajDefterim Test E-postası',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #9C27B0, #7B1FA2); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🧪 StajDefterim</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Test E-postası</p>
        </div>
        
        <div style="background: #f3e5f5; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <h2 style="color: #333; margin-top: 0; font-size: 22px;">✅ E-posta Sistemi Çalışıyor!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Bu test e-postasını ${new Date().toLocaleString('tr-TR')} tarihinde aldıysanız, 
            e-posta bildirim sistemi düzgün çalışıyor demektir.
          </p>
          
          <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #9C27B0;">
            <p style="margin: 0; color: #333;"><strong>👤 Kullanıcı:</strong> ${data.user.name}</p>
            <p style="margin: 5px 0 0 0; color: #666;"><strong>📧 E-posta:</strong> ${data.user.email}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="exp://stajdefterim" style="display: inline-block; background: #9C27B0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">📱 Uygulamaya Dön</a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 14px;">
          <p>Bu test e-postası StajDefterim uygulaması tarafından gönderilmiştir.</p>
        </div>
      </div>
    `
  })
};

class EmailService {
  constructor() {
    this.transporter = transporter;
    this.templates = emailTemplates;
  }

  // E-posta gönderme fonksiyonu
  async sendEmail(to, template, data) {
    try {
      console.log(`📧 Debug - sendEmail called with:`, { to, template, data });
      
      if (!this.templates[template]) {
        throw new Error(`Email template '${template}' not found`);
      }

      const emailContent = this.templates[template](data);
      
      const mailOptions = {
        from: config.EMAIL_CONFIG.from,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html
      };

      console.log(`📧 Sending ${template} email to: ${to}`);
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        template: template
      };
    } catch (error) {
      console.error(`❌ Email sending failed:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Hatırlatıcı e-postası gönder
  async sendReminderEmail(userEmail, reminderData) {
    console.log(`🔧 sendReminderEmail called:`, { userEmail, reminderData });
    return await this.sendEmail(userEmail, 'reminder', reminderData);
  }

  // Görev deadline e-postası gönder
  async sendTaskDeadlineEmail(userEmail, taskData) {
    const priorityEmojis = {
      'acil': '🚨',
      'onemli': '⚡',
      'orta': '📋',
      'dusuk': '📝'
    };

    const emailData = {
      ...taskData,
      priorityEmoji: priorityEmojis[taskData.task.priority] || '📋'
    };

    return await this.sendEmail(userEmail, 'taskDeadline', emailData);
  }

  // Günlük özet e-postası gönder
  async sendDailySummaryEmail(userEmail, summaryData) {
    return await this.sendEmail(userEmail, 'dailySummary', summaryData);
  }

  // Test e-postası gönder
  async sendTestEmail(userEmail, userData) {
    return await this.sendEmail(userEmail, 'test', { user: userData });
  }

  // E-posta bağlantısını test et
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
