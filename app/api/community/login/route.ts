import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.collection('community_users').findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
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