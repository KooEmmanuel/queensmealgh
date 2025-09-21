import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Add a comment to a discussion
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { discussionId, content, author } = body;
    
    if (!discussionId || !content || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const comment = {
      _id: new ObjectId(),
      content,
      author,
      createdAt: new Date(),
      likes: 0
    };
    
    const result = await db.collection('discussions').updateOne(
      { _id: new ObjectId(discussionId) },
      { $push: { comments: comment } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
} 