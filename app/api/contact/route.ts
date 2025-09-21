import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, type } = body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Store the contact form submission in the database
    const result = await db.collection('contact_submissions').insertOne({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      type: type || 'general',
      createdAt: new Date(),
      status: 'new'
    });
    
    return NextResponse.json({
      success: true,
      id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    const submissions = await db.collection('contact_submissions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact submissions' },
      { status: 500 }
    );
  }
} 