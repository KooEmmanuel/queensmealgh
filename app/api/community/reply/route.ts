import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { commentId, content, author } = body;

    if (!commentId || !content || !author) {
      return NextResponse.json(
        { error: 'Comment ID, content, and author are required' },
        { status: 400 }
      );
    }

    if (content.length < 1 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Reply must be between 1 and 1000 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.collection('community_users').findOne({
      username: author.toLowerCase()
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the thread containing this comment
    const thread = await db.collection('threads').findOne({
      'comments._id': new ObjectId(commentId)
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Create new reply
    const newReply = {
      _id: new ObjectId(),
      content: content.trim(),
      author: author.toLowerCase(),
      createdAt: new Date(),
      likes: 0
    };

    // Add reply to the comment
    const result = await db.collection('threads').updateOne(
      { 'comments._id': new ObjectId(commentId) },
      { 
        $push: { 'comments.$.replies': newReply },
        $set: { 
          lastActivity: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Update user's comment count and reputation
    await db.collection('community_users').updateOne(
      { username: author.toLowerCase() },
      { 
        $inc: { 
          commentCount: 1,
          reputation: 2 // 2 points for a reply
        },
        $set: { lastActive: new Date() }
      }
    );

    return NextResponse.json({
      success: true,
      reply: {
        ...newReply,
        _id: newReply._id.toString()
      }
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