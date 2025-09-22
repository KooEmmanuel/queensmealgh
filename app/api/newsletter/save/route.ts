import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    const body = await request.json();
    const {
      subject,
      previewText,
      content,
      tags,
      status = 'draft',
      createdAt
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

    // Create newsletter document
    const newsletterData = {
      subject,
      previewText: previewText || '',
      content,
      tags: tags || [],
      status,
      createdAt: new Date(createdAt || new Date()),
      updatedAt: new Date(),
      sentAt: null,
      recipientCount: 0,
      openCount: 0,
      clickCount: 0
    };

    const result = await db.collection('newsletters').insertOne(newsletterData);

    return NextResponse.json({
      success: true,
      message: 'Newsletter saved successfully',
      newsletterId: result.insertedId.toString()
    });

  } catch (error) {
    console.error('Error saving newsletter:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save newsletter' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    // Build query
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const newsletters = await db.collection('newsletters')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('newsletters').countDocuments(query);

    return NextResponse.json({
      success: true,
      newsletters: newsletters.map(newsletter => ({
        ...newsletter,
        _id: newsletter._id.toString()
      })),
      total,
      hasMore: skip + newsletters.length < total
    });
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch newsletters' 
      },
      { status: 500 }
    );
  }
}