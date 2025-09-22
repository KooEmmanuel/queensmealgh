const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log('🔧 Testing SMTP Configuration...\n');

  // Check if required environment variables are set
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease add these variables to your .env file');
    return;
  }

  console.log('✅ All required environment variables are set\n');

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true,
  });

  try {
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    
    // Send test email
    console.log('📧 Sending test email...');
    const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER;
    
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Queen\'s Meal'}" <${process.env.FROM_EMAIL}>`,
      to: testEmail,
      subject: 'Test Newsletter - SMTP Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669, #ea580c); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Queen's Meal</h1>
            <p style="color: #d1fae5; margin: 5px 0 0 0;">Test Newsletter</p>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #111827;">🎉 SMTP Configuration Successful!</h2>
            <p style="color: #374151; line-height: 1.6;">
              Congratulations! Your SMTP configuration is working correctly. 
              This test email was sent from your Queen's Meal newsletter system.
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0 0 10px 0;">Configuration Details:</h3>
              <ul style="color: #047857; margin: 0;">
                <li>SMTP Host: ${process.env.SMTP_HOST}</li>
                <li>SMTP Port: ${process.env.SMTP_PORT}</li>
                <li>From Email: ${process.env.FROM_EMAIL}</li>
                <li>From Name: ${process.env.FROM_NAME || 'Queen\'s Meal'}</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              You can now send newsletters to your subscribers through the admin panel.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is a test email from Queen's Meal newsletter system
            </p>
          </div>
        </div>
      `,
      text: `
        Queen's Meal - Test Newsletter
        
        SMTP Configuration Successful!
        
        Congratulations! Your SMTP configuration is working correctly. 
        This test email was sent from your Queen's Meal newsletter system.
        
        Configuration Details:
        - SMTP Host: ${process.env.SMTP_HOST}
        - SMTP Port: ${process.env.SMTP_PORT}
        - From Email: ${process.env.FROM_EMAIL}
        - From Name: ${process.env.FROM_NAME || 'Queen\'s Meal'}
        
        You can now send newsletters to your subscribers through the admin panel.
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Sent to: ${testEmail}\n`);
    
    console.log('🎉 SMTP configuration is working perfectly!');
    console.log('You can now use the newsletter system to send emails to your subscribers.');
    
  } catch (error) {
    console.error('❌ SMTP test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Authentication failed. Please check:');
      console.error('   - Username and password are correct');
      console.error('   - For Gmail: Enable 2FA and use App Password');
      console.error('   - For other providers: Check API keys');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🌐 Connection failed. Please check:');
      console.error('   - SMTP host and port are correct');
      console.error('   - Internet connection is working');
      console.error('   - Firewall is not blocking the connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⏰ Connection timeout. Please check:');
      console.error('   - SMTP host and port are correct');
      console.error('   - Try different port (465 for SSL, 587 for TLS)');
    }
    
    console.error('\nFor more help, check the SMTP_SETUP.md file');
  }
}

// Run the test
testSMTP().catch(console.error);