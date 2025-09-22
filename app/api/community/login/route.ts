import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await db.collection('community_users').findOne({
      username: username.toLowerCase()
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update last active
    await db.collection('community_users').updateOne(
      { _id: user._id },
      { $set: { lastActive: new Date() } }
    );

    // Return user data (without sensitive information)
    const userData = {
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      joinDate: user.joinDate,
      lastActive: new Date(),
      postCount: user.postCount,
      commentCount: user.commentCount,
      likeCount: user.likeCount,
      reputation: user.reputation,
      badges: user.badges,
      isVerified: user.isVerified
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to login user' 
      },
      { status: 500 }
    );
  }
}