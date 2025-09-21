import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Like a discussion or comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { discussionId, commentId } = body;
    
    if (!discussionId) {
      return NextResponse.json(
        { error: 'Missing discussion ID' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // If commentId is provided, like a comment
    if (commentId) {
      const result = await db.collection('discussions').updateOne(
        { 
          _id: new ObjectId(discussionId),
          "comments._id": new ObjectId(commentId)
        },
        { $inc: { "comments.$.likes": 1 } }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Discussion or comment not found' },
          { status: 404 }
        );
      }
    } else {
      // Otherwise, like the discussion
      const result = await db.collection('discussions').updateOne(
        { _id: new ObjectId(discussionId) },
        { $inc: { likes: 1 } }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Discussion not found' },
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