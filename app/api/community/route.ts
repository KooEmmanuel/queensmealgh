import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all discussions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const { db } = await connectToDatabase();
    
    // If an ID is provided, fetch a specific discussion
    if (id) {
      const discussion = await db.collection('discussions').findOne({
        _id: new ObjectId(id)
      });
      
      if (!discussion) {
        return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
      }
      
      return NextResponse.json(discussion);
    }
    
    // Otherwise, fetch all discussions
    // Try new threads collection first, fallback to legacy discussions
    let discussions;
    
    try {
      const threads = await db.collection('threads')
        .find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
      
      // Map threads to legacy discussion format for backward compatibility
      discussions = threads.map(thread => ({
        _id: thread._id,
        title: thread.title,
        content: thread.content,
        author: thread.author,
        createdAt: thread.createdAt,
        likes: thread.likes,
        comments: thread.comments || []
      }));
    } catch (error) {
      // Fallback to legacy discussions collection
      discussions = await db.collection('discussions')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    }
    
    return NextResponse.json(discussions);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

// POST - Create a new discussion
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, author } = body;
    
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const newDiscussion = {
      title,
      content,
      author,
      createdAt: new Date(),
      likes: 0,
      comments: []
    };
    
    const result = await db.collection('discussions').insertOne(newDiscussion);
    
    return NextResponse.json({
      _id: result.insertedId,
      ...newDiscussion
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
} 