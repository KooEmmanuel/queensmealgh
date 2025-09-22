import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Like a thread or comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { threadId, commentId, userId } = body;
    
    if (!threadId) {
      return NextResponse.json(
        { error: 'Missing thread ID' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if user exists
    if (userId) {
      const user = await db.collection('community_users').findOne({
        _id: new ObjectId(userId)
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }
    
    // If commentId is provided, like a comment
    if (commentId) {
      const result = await db.collection('threads').updateOne(
        { 
          _id: new ObjectId(threadId),
          "comments._id": new ObjectId(commentId)
        },
        { $inc: { "comments.$.likes": 1 } }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Thread or comment not found' },
          { status: 404 }
        );
      }
    } else {
      // Otherwise, like the thread
      const result = await db.collection('threads').updateOne(
        { _id: new ObjectId(threadId) },
        { $inc: { likes: 1 } }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Thread not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking item:', error);
    return NextResponse.json(
      { error: 'Failed to like item' },
      { status: 500 }
    );
  }
} 