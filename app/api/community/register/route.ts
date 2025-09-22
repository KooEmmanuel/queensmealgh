import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { username, displayName, email, bio } = body;

    // Validate required fields
    if (!username || !displayName) {
      return NextResponse.json(
        { error: 'Username and display name are required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.collection('community_users').findOne({
      username: username.toLowerCase()
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Check if email is already used (if provided)
    if (email) {
      const existingEmail = await db.collection('community_users').findOne({
        email: email.toLowerCase()
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
    }

    // Create new user
    const newUser = {
      username: username.toLowerCase(),
      displayName,
      email: email?.toLowerCase() || null,
      bio: bio || '',
      avatar: null,
      joinDate: new Date(),
      lastActive: new Date(),
      postCount: 0,
      commentCount: 0,
      likeCount: 0,
      reputation: 0,
      badges: ['newcomer'],
      isVerified: false,
      preferences: {
        notifications: true,
        emailNotifications: false,
        theme: 'light'
      },
      stats: {
        totalLikes: 0,
        totalViews: 0,
        bestPost: null,
        achievements: []
      }
    };

    const result = await db.collection('community_users').insertOne(newUser);

    // Return user data (without sensitive information)
    const userData = {
      _id: result.insertedId.toString(),
      username: newUser.username,
      displayName: newUser.displayName,
      email: newUser.email,
      bio: newUser.bio,
      avatar: newUser.avatar,
      joinDate: newUser.joinDate,
      lastActive: newUser.lastActive,
      postCount: newUser.postCount,
      commentCount: newUser.commentCount,
      likeCount: newUser.likeCount,
      reputation: newUser.reputation,
      badges: newUser.badges,
      isVerified: newUser.isVerified
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register user' 
      },
      { status: 500 }
    );
  }
}