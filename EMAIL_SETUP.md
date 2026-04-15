# 📧 Email Setup Guide for Prompt Forge

To enable email invitations for team members, you need to configure email settings. Here are the most common setups:

## 🚀 Quick Setup Options

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Add to your `.env.local` file**:
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM="Prompt Forge Team" <your-email@gmail.com>
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Option 2: SendGrid (Recommended for Production)

1. **Create SendGrid account** at https://sendgrid.com
2. **Generate API Key** in SendGrid dashboard
3. **Add to your `.env.local` file**:
```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM="Prompt Forge Team" <noreply@yourdomain.com>
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Option 3: Custom SMTP

```bash
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM="Prompt Forge Team" <noreply@yourdomain.com>
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 🧪 Testing Email Setup

### Development Mode
- Without email configuration, the system will use Ethereal Email (fake SMTP)
- Check console logs for preview URLs to see how emails look
- No actual emails are sent in development mode

### Production Mode
- Emails will be sent using your configured service
- Test with a real email address first
- Check spam folders if emails don't arrive

## 🔧 Troubleshooting

### Gmail Issues
- **"Less secure app access"** is deprecated - use App Passwords
- Make sure 2FA is enabled before generating App Password
- Use the 16-character app password, not your regular password

### SendGrid Issues
- Verify your sender identity in SendGrid
- Check API key permissions
- Monitor SendGrid dashboard for delivery status

### General Issues
- Check environment variables are loaded correctly
- Verify NEXT_PUBLIC_APP_URL matches your domain
- Check server logs for detailed error messages

## 📝 Environment Variables Reference

```bash
# Required for all setups
NEXT_PUBLIC_APP_URL=http://localhost:3001  # Your app URL
EMAIL_FROM="Your Team Name" <noreply@domain.com>  # From address

# Gmail setup
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SendGrid setup  
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key

# Custom SMTP setup
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASS=password
```

## 🎯 Quick Test

1. Set up your email configuration
2. Restart your development server: `npm run dev`
3. Go to `/team` page
4. Click "Invite Team Member"
5. Fill in details and submit
6. Check console logs for email preview (development) or inbox (production)

## 🔒 Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive data
- Consider using App Passwords instead of main passwords
- For production, use dedicated email services like SendGrid

---

Need help? Check the console logs for detailed error messages or create an issue in the repository.