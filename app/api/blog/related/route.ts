import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Find related posts by category, excluding the current post
    const relatedPosts = await db.collection('blog_posts')
      .find({
        _id: { $ne: new ObjectId(id) },
        category: category,
        status: 'published'
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    // If we don't have enough related posts by category, get some recent posts
    if (relatedPosts.length < 3) {
      const additionalPosts = await db.collection('blog_posts')
        .find({
          _id: { $ne: new ObjectId(id) },
          category: { $ne: category },
          status: 'published'
        })
        .sort({ createdAt: -1 })
        .limit(3 - relatedPosts.length)
        .toArray();
      
      relatedPosts.push(...additionalPosts);
    }
    
    return NextResponse.json(relatedPosts);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related posts' },
      { status: 500 }
    );
  }
} 