import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '1';
    
    const { db } = await connectToDatabase();
    
    let query = {};
    
    // Apply category filters
    if (category === '2') {
      // Recent posts
      query = {};
      // Sort by date in the aggregation
    } else if (category === '3') {
      // Food category
      query = { caption: { $regex: 'food|recipe|cooking', $options: 'i' } };
    } else if (category === '4') {
      // Recipes category
      query = { caption: { $regex: 'recipe|how to make', $options: 'i' } };
    } else if (category === '5') {
      // Videos category
      query = { isPlayable: true };
    }
    // Default is Popular (category === '1')
    
    const posts = await db.collection('instagram_posts')
      .find(query)
      .sort(category === '2' ? { createdAt: -1 } : { likes: -1 })
      .limit(6)
      .toArray();
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Instagram posts' },
      { status: 500 }
    );
  }
} 