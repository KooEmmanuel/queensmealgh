import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    const { default: mongoose } = await import('mongoose');
    const db = mongoose.connection.db;
    
    const contacts = await db.collection('contact_submissions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(contacts, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch contact submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();
    const { default: mongoose } = await import('mongoose');
    const db = mongoose.connection.db;
    
    const result = await db.collection('contact_submissions').insertOne({
      ...body,
      createdAt: new Date(),
      status: 'new'
    });
    
    return NextResponse.json(
      { message: 'Contact submission created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating contact submission:', error);
    return NextResponse.json(
      { message: 'Failed to create contact submission' },
      { status: 500 }
    );
  }
}