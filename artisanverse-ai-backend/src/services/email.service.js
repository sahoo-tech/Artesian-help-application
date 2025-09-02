const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  async initialize() {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️  Email credentials not configured. Email service will use mock mode.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Use App Password for Gmail
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      console.warn('📧 Email service running in mock mode');
    }
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.transporter) {
        console.log(`📧 [MOCK EMAIL] To: ${to}, Subject: ${subject}`);
        return { success: true, messageId: 'mock-id', mock: true };
      }

      const mailOptions = {
        from: `"ArtisanVerse" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || this.htmlToText(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${result.messageId}`);

      return { success: true, messageId: result.messageId, mock: false };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message, mock: false };
    }
  }

  async sendWelcomeEmail(user) {
    const html = this.generateWelcomeTemplate(user);

    return await this.sendEmail({
      to: user.email,
      subject: `Welcome to ArtisanVerse, ${user.firstName}! 🎨`,
      html
    });
  }

  async sendOrderConfirmation(order, user) {
    const html = this.generateOrderConfirmationTemplate(order, user);

    return await this.sendEmail({
      to: user.email,
      subject: `Order Confirmed - ${order.orderNumber} 📦`,
      html
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const html = this.generatePasswordResetTemplate(user, resetToken);

    return await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request 🔐',
      html
    });
  }

  async sendArtisanApprovalEmail(artisan) {
    const html = this.generateArtisanApprovalTemplate(artisan);

    return await this.sendEmail({
      to: artisan.email,
      subject: 'Welcome to ArtisanVerse - Your profile is approved! 🎉',
      html
    });
  }

  generateWelcomeTemplate(user) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background: linear-gradient(135deg, #FFF8F0, #F5F5F5);
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px; 
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header { 
                background: linear-gradient(135deg, #D4A574, #B8956A); 
                color: white; 
                padding: 40px 20px; 
                text-align: center; 
                border-radius: 12px 12px 0 0;
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: bold; 
            }
            .content { 
                padding: 30px; 
                background: #FEFEFE; 
            }
            .welcome-message {
                font-size: 18px;
                color: #1A365D;
                margin-bottom: 20px;
            }
            .features {
                background: #FFF8F0;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #D4A574;
            }
            .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #D4A574, #B8956A); 
                color: white; 
                padding: 14px 28px; 
                text-decoration: none; 
                border-radius: 8px; 
                margin: 15px 0; 
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .footer { 
                text-align: center; 
                padding: 20px; 
                color: #666; 
                font-size: 12px; 
                background: #F8F9FA;
                border-radius: 0 0 12px 12px;
            }
            .cultural-pattern {
                height: 4px;
                background: linear-gradient(90deg, #D4A574, #8B4513, #D4A574);
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 Welcome to ArtisanVerse!</h1>
                <p>Where Culture Meets Technology</p>
            </div>
            <div class="content">
                <div class="welcome-message">
                    <strong>Namaste ${user.firstName}!</strong> 🙏
                </div>
                <p>Welcome to ArtisanVerse, the world's most advanced AI-powered cultural heritage marketplace! We're thrilled to have you join our global community of culture enthusiasts and master artisans.</p>

                <div class="cultural-pattern"></div>

                <div class="features">
                    <h3>🌟 Your ArtisanVerse Journey Begins:</h3>
                    <ul>
                        <li><strong>AI-Powered Discovery:</strong> Let our AI assistant guide your cultural exploration</li>
                        <li><strong>Authentic Crafts:</strong> Every piece comes with verified authenticity certificates</li>
                        <li><strong>Cultural Stories:</strong> Learn the rich heritage behind each creation</li>
                        <li><strong>Global Community:</strong> Connect with artisans and culture lovers worldwide</li>
                        ${user.role === 'artisan' ? '<li><strong>AI Business Mentor:</strong> Get personalized guidance to grow your craft business</li>' : ''}
                    </ul>
                </div>

                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="button">
                        🚀 Start Your Cultural Journey
                    </a>
                </div>

                <p>Questions? Our support team is here to help you every step of the way.</p>

                <p>With warm regards,<br>
                <strong>The ArtisanVerse Team</strong> 🎨</p>
            </div>
            <div class="footer">
                <div class="cultural-pattern"></div>
                <p>© 2025 ArtisanVerse - Preserving Culture Through Innovation</p>
                <p>Powered by AI • Inspired by Heritage • Built for Global Community</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  generateOrderConfirmationTemplate(order, user) {
    const itemsList = order.items.map(item => 
      `<li>${item.title} - $${item.price} x ${item.quantity}</li>`
    ).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2C5530; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #FEFEFE; }
            .order-details { background: #F8F9FA; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28A745; }
            .button { display: inline-block; background: #28A745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #F8F9FA; }
            .cultural-divider { height: 3px; background: linear-gradient(90deg, #D4A574, #28A745, #D4A574); margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Order Confirmed!</h1>
                <p>Your cultural treasures are being prepared</p>
            </div>
            <div class="content">
                <p>Dear ${user.firstName},</p>
                <p>Thank you for supporting traditional artisans! Your order helps preserve cultural heritage worldwide.</p>

                <div class="cultural-divider"></div>

                <div class="order-details">
                    <h3>📦 Order Details</h3>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Total:</strong> $${order.total}</p>
                    <ul>${itemsList}</ul>
                    <p><strong>Status:</strong> Confirmed & Being Prepared</p>
                </div>

                <p>🔐 <strong>Authenticity Guarantee:</strong> Each item comes with a blockchain-verified authenticity certificate.</p>
                <p>📱 Track your order and explore more cultural stories in your ArtisanVerse dashboard.</p>

                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">
                        Track Your Order
                    </a>
                </div>

                <p>Thank you for being part of our cultural preservation mission!</p>

                <p>With gratitude,<br><strong>ArtisanVerse Team</strong> 🎨</p>
            </div>
            <div class="footer">
                <p>© 2025 ArtisanVerse - Every Purchase Preserves Culture</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  generatePasswordResetTemplate(user, token) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #E53E3E; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #FEFEFE; }
            .button { display: inline-block; background: #E53E3E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; }
            .warning { background: #FFF3CD; padding: 15px; border-radius: 6px; border-left: 4px solid #FFC107; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello ${user.firstName},</p>
                <p>We received a request to reset your ArtisanVerse password. Click the button below to create a new password:</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>

                <div class="warning">
                    <strong>⚠️ Security Notice:</strong><br>
                    • This link expires in 1 hour<br>
                    • If you didn't request this, please ignore this email<br>
                    • Never share this link with anyone
                </div>

                <p>Having trouble? Contact our support team for assistance.</p>

                <p>Stay secure,<br><strong>ArtisanVerse Security Team</strong></p>
            </div>
        </div>
    </body>
    </html>`;
  }

  generateArtisanApprovalTemplate(artisan) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4A574, #B8956A); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #FEFEFE; }
            .celebration { text-align: center; font-size: 48px; margin: 20px 0; }
            .benefits { background: #FFF8F0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4A574; }
            .button { display: inline-block; background: linear-gradient(135deg, #D4A574, #B8956A); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; }
            .cultural-pattern { height: 4px; background: linear-gradient(90deg, #D4A574, #8B4513, #D4A574); margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to ArtisanVerse!</h1>
                <p>Your artisan profile has been approved</p>
            </div>
            <div class="content">
                <div class="celebration">
                    🎨 ✨ 🌟 ✨ 🎨
                </div>

                <p><strong>Congratulations ${artisan.firstName}!</strong></p>

                <p>Your ${artisan.craftType} artisan profile has been approved! You're now part of the world's most advanced AI-powered cultural heritage marketplace.</p>

                <div class="cultural-pattern"></div>

                <div class="benefits">
                    <h3>🚀 Your AI-Powered Journey Starts Now:</h3>
                    <ul>
                        <li><strong>🤖 AI Business Mentor:</strong> Get personalized guidance on pricing, marketing, and growth</li>
                        <li><strong>🎯 Smart Product Optimization:</strong> AI-generated descriptions and SEO optimization</li>
                        <li><strong>🌍 Global Marketplace:</strong> Reach culture enthusiasts worldwide</li>
                        <li><strong>🔐 Blockchain Certificates:</strong> Every sale comes with authenticity verification</li>
                        <li><strong>📊 Analytics Dashboard:</strong> Track your business growth with AI insights</li>
                        <li><strong>💰 Fair Pricing:</strong> AI-powered market analysis for optimal pricing</li>
                    </ul>
                </div>

                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL}/artisan/dashboard" class="button">
                        🎨 Start Selling
                    </a>
                    <a href="${process.env.CLIENT_URL}/artisan/ai-mentor" class="button">
                        🤖 Meet Your AI Mentor
                    </a>
                </div>

                <p>🎓 <strong>Getting Started:</strong> Visit your AI mentor for personalized business guidance, or start uploading your first product with AI-powered optimization.</p>

                <p>We're excited to help you share your cultural heritage with the world!</p>

                <p>With respect and admiration,<br>
                <strong>The ArtisanVerse Team</strong> 🎨</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}

module.exports = new EmailService();
