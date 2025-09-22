import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET - Check if username exists
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if username exists in the users collection
    const existingUser = await db.collection('community_users').findOne({
      username: username.toLowerCase()
    });
    
    // Also check if any thread has this author name
    const existingAuthor = await db.collection('threads').findOne({
      author: username
    });
    
    const exists = !!existingUser || !!existingAuthor;
    
    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { error: 'Failed to check username' },
      { status: 500 }
    );
  }
}

// POST - Register a new username
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if username already exists
    const existingUser = await db.collection('community_users').findOne({
      username: username.toLowerCase()
    });
    
    // Also check if any thread has this author name
    const existingAuthor = await db.collection('threads').findOne({
      author: username
    });
    
    if (existingUser || existingAuthor) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }
    
    // Register the new username
    await db.collection('community_users').insertOne({
      username: username.toLowerCase(),
      displayName: username,
      createdAt: new Date()
    });
    
    return NextResponse.json({ success: true, username });
  } catch (error) {
    console.error('Error registering username:', error);
    return NextResponse.json(
      { error: 'Failed to register username' },
      { status: 500 }
    );
  }
} 