import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { broadcastUpdate } from '../events/route';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { threadId, commentId, content, authorId } = body;

    // Validate required fields
    if (!threadId || !commentId || !content || !authorId) {
      return NextResponse.json(
        { error: 'Thread ID, comment ID, content, and author ID are required' },
        { status: 400 }
      );
    }

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

    // Check if thread exists
    const thread = await db.collection('threads').findOne({
      _id: new ObjectId(threadId)
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Create reply object
    const reply = {
      _id: new ObjectId(),
      content,
      author: user.username,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatar,
      authorReputation: user.reputation,
      createdAt: new Date(),
      likes: 0,
      isLiked: false
    };

    // Add reply to the comment
    const result = await db.collection('threads').updateOne(
      { 
        _id: new ObjectId(threadId),
        "comments._id": new ObjectId(commentId)
      },
      { 
        $push: { "comments.$.replies": reply },
        $inc: { "comments.$.replyCount": 1 }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Broadcast reply update
    broadcastUpdate('new_reply', {
      threadId,
      commentId,
      reply
    });

    return NextResponse.json({
      success: true,
      reply,
      message: 'Reply added successfully'
    });

  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add reply' 
      },
      { status: 500 }
    );
  }
}