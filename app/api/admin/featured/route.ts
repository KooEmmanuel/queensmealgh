import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    const { default: mongoose } = await import('mongoose');
    const db = mongoose.connection.db;
    
    const featuredContent = await db.collection('featured_content')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(featuredContent, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching featured content:', error);
    return NextResponse.json(
      { message: 'Failed to fetch featured content' },
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
    
    const result = await db.collection('featured_content').insertOne({
      ...body,
      createdAt: new Date(),
      isActive: true
    });
    
    return NextResponse.json(
      { message: 'Featured content created successfully', id: result.insertedId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating featured content:', error);
    return NextResponse.json(
      { message: 'Failed to create featured content' },
      { status: 500 }
    );
  }
}