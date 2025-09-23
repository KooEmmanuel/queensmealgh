import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { threadIds } = body;

    if (!threadIds || !Array.isArray(threadIds) || threadIds.length === 0) {
      return NextResponse.json(
        { error: 'Thread IDs are required' },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    const objectIds = threadIds.map(id => new ObjectId(id));

    // Increment view count for all threads
    const result = await db.collection('threads').updateMany(
      { _id: { $in: objectIds } },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: 'Views tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking views:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track views' 
      },
      { status: 500 }
    );
  }
}