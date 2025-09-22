import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { generateHTMLEmailTemplate } from '@/components/EmailTemplate';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    const body = await request.json();
    const {
      subject,
      previewText,
      content,
      tags,
      status = 'sent',
      sentAt,
      recipients,
      subscriberIds,
      manualEmails
    } = body;

    // Validate required fields
    if (!subject || !content) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: subject and content are required' 
        },
        { status: 400 }
      );
    }

    // Determine recipients
    let allRecipients: string[] = [];
    
    if (recipients && recipients.length > 0) {
      // Use provided recipients list
      allRecipients = recipients;
    } else {
      // Fallback to old behavior - get all active subscribers
      const subscribers = await db.collection('newsletter_subscriptions')
        .find({ status: 'active' })
        .toArray();
      
      allRecipients = subscribers.map((sub: any) => sub.email);
    }

    // Add manual emails if provided
    if (manualEmails && manualEmails.length > 0) {
      const validManualEmails = manualEmails.filter((email: string) => 
        email && email.trim() && email.includes('@')
      );
      allRecipients = [...allRecipients, ...validManualEmails];
    }

    // Remove duplicates
    allRecipients = [...new Set(allRecipients)];

    if (allRecipients.length === 0) {
      return NextResponse.json(
        { 
          error: 'No recipients found' 
        },
        { status: 400 }
      );
    }

    // Generate HTML email template
    const htmlContent = generateHTMLEmailTemplate({
      subject,
      previewText,
      content,
      tags
    });

    // Create newsletter record
    const newsletterData = {
      subject,
      previewText: previewText || '',
      content,
      tags: tags || [],
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentAt: new Date(sentAt || new Date()),
      recipientCount: allRecipients.length,
      openCount: 0,
      clickCount: 0,
      htmlContent,
      recipients: allRecipients,
      subscriberIds: subscriberIds || [],
      manualEmails: manualEmails || []
    };

    const result = await db.collection('newsletters').insertOne(newsletterData);
    const newsletterId = result.insertedId.toString();

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send emails to all recipients
    const emailPromises = allRecipients.map(async (email: string) => {
      try {
        const mailOptions = {
          from: `"${process.env.FROM_NAME || 'Queen\'s Meal'}" <${process.env.FROM_EMAIL}>`,
          to: email,
          subject: content.subject,
          html: htmlContent,
          text: content.previewText, // Fallback text version
        };

        const info = await transporter.sendMail(mailOptions);
        
        return {
          email: email,
          status: 'sent',
          messageId: info.messageId
        };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return {
          email: email,
          status: 'failed',
          error: (error as Error).message
        };
      }
    });

    // Wait for all emails to be processed
    const emailResults = await Promise.all(emailPromises);
    
    // Count successful sends
    const successfulSends = emailResults.filter(result => result.status === 'sent').length;
    const failedSends = emailResults.filter(result => result.status === 'failed').length;

    // Update newsletter with send results
    await db.collection('newsletters').updateOne(
      { _id: result.insertedId },
      { 
        $set: { 
          recipientCount: successfulSends,
          sendResults: emailResults,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Newsletter sent successfully',
      newsletterId,
      stats: {
        totalRecipients: allRecipients.length,
        successfulSends,
        failedSends
      }
    });

  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send newsletter' 
      },
      { status: 500 }
    );
  }
}
