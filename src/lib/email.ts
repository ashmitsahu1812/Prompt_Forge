import nodemailer from 'nodemailer';

// Email configuration - you can use different providers
const createTransporter = () => {
  // For development, you can use Ethereal Email (fake SMTP)
  // For production, use your preferred email service (Gmail, SendGrid, etc.)

  if (process.env.NODE_ENV === 'development') {
    // Development: Use Ethereal Email for testing
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  // Production: Configure your email service
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password for Gmail
      }
    });
  }

  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Default SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export interface InvitationEmailData {
  recipientEmail: string;
  recipientName: string;
  inviterName: string;
  teamName: string;
  role: string;
  inviteToken: string;
  inviteUrl: string;
}

export async function sendTeamInvitation(data: InvitationEmailData) {
  try {
    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Team Invitation - Prompt Forge</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 40px 30px; text-align: center; }
            .logo { color: #ffffff; font-size: 28px; font-weight: 900; margin-bottom: 10px; }
            .content { padding: 40px 30px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Prompt Forge</div>
                <div style="color: #e2e8f0; font-size: 14px; font-weight: 600;">Team Invitation</div>
            </div>
            
            <div class="content">
                <h2>Hi ${data.recipientName}! 👋</h2>
                
                <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.teamName}</strong> on Prompt Forge as a <strong>${data.role}</strong>.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.inviteUrl}" class="cta-button">
                        Accept Invitation & Join Team
                    </a>
                </div>
                
                <p><strong>This invitation will expire in 7 days.</strong></p>
                
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                
                <p style="font-size: 14px; color: #64748b;">
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="${data.inviteUrl}">${data.inviteUrl}</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const textContent = `
Hi ${data.recipientName}!

${data.inviterName} has invited you to join ${data.teamName} on Prompt Forge as a ${data.role}.

Accept your invitation: ${data.inviteUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

---
Prompt Forge Team
    `;

    const mailOptions = {
      from: `"Prompt Forge" <${process.env.EMAIL_FROM || 'noreply@promptforge.dev'}>`,
      to: data.recipientEmail,
      subject: `You're invited to join ${data.teamName} on Prompt Forge`,
      text: textContent,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('✅ Invitation email sent:', result.messageId);

    // For development with Ethereal, log the preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
    }

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
}