import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const featuredPosts = await db.collection('blog_posts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    return NextResponse.json(featuredPosts);
  } catch (error) {
    console.error('Error fetching featured blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured blog posts' },
      { status: 500 }
    );
  }
} 