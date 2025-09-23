import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { broadcastUpdate } from '../events/route';

// POST - Add a comment to a thread
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { threadId, content, authorId } = body;
    
    if (!threadId || !content || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if user exists
    const user = await db.collection('community_users').findOne({
      _id: new ObjectId(authorId)
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const comment = {
      _id: new ObjectId(),
      content,
      author: user.username,
      authorId: new ObjectId(authorId),
      createdAt: new Date(),
      likes: 0,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatar,
      authorReputation: user.reputation
    };
    
    const result = await db.collection('threads').updateOne(
      { _id: new ObjectId(threadId) },
      { 
        $push: { comments: comment },
        $inc: { commentCount: 1 },
        $set: { lastActivity: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }
    
    // Broadcast the new comment to all connected clients
    broadcastUpdate('new_comment', {
      threadId,
      comment
    });
    
    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
} 