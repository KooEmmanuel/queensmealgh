# Gmail SMTP Setup for Newsletter

## Quick Setup Guide

### 1. Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Follow the setup process

### 2. Generate App Password
1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Click "App passwords"
3. Select "Mail" as the app
4. Copy the 16-character password (like: `abcd efgh ijkl mnop`)

### 3. Update Your .env File
Replace the placeholder values in your `.env` file:

```env
# Gmail SMTP Configuration for Newsletter
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-actual-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
FROM_EMAIL=your-actual-gmail@gmail.com
FROM_NAME=Queen's Meal
```

**Example:**
```env
SMTP_USER=queensmeal@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
FROM_EMAIL=queensmeal@gmail.com
```

### 4. Test Your Setup
Run the test script:
```bash
node test-smtp.js
```

You should see:
```
✅ SMTP connection successful!
✅ Test email sent successfully!
```

### 5. Send Your First Newsletter
1. Go to `/admin/newsletter`
2. Create a newsletter using AI
3. Add subscribers to your database
4. Send the newsletter!

## Troubleshooting

### "Authentication failed"
- Make sure you're using the **App Password**, not your regular Gmail password
- Ensure 2-Factor Authentication is enabled
- Check that the email address is correct

### "Connection timeout"
- Check your internet connection
- Try port 465 instead of 587 (change `SMTP_PORT=465` and `SMTP_SECURE=true`)

### "Email not delivered"
- Check your spam folder
- Make sure the recipient email is valid
- Wait a few minutes for delivery

## Limits
- **500 emails per day** (Gmail limit)
- Perfect for getting started and small newsletters
- Upgrade to professional service when you need more

## That's it! 🎉
Your newsletter system is now ready to send emails through Gmail!