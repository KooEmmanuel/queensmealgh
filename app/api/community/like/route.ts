import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { broadcastUpdate } from '../events/route';

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
      console.log('Liking comment:', commentId, 'in thread:', threadId);
      
      const result = await db.collection('threads').updateOne(
        { 
          _id: new ObjectId(threadId),
          "comments._id": new ObjectId(commentId)
        },
        { $inc: { "comments.$.likes": 1 } }
      );
      
      console.log('Comment like result:', result);
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Thread or comment not found' },
          { status: 404 }
        );
      }
      
      // Broadcast comment like update
      broadcastUpdate('comment_liked', {
        threadId,
        commentId
      });
    } else {
      // Otherwise, like the thread
      console.log('Attempting to like thread:', threadId);
      
      // First check if thread exists
      const thread = await db.collection('threads').findOne({
        _id: new ObjectId(threadId)
      });
      
      if (!thread) {
        console.log('Thread not found:', threadId);
        return NextResponse.json(
          { error: 'Thread not found' },
          { status: 404 }
        );
      }
      
      const result = await db.collection('threads').updateOne(
        { _id: new ObjectId(threadId) },
        { $inc: { likes: 1 } }
      );
      
      console.log('Like result:', result);
      
      // Broadcast thread like update
      broadcastUpdate('thread_liked', {
        threadId
      });
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