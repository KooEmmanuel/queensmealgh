import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    const post = await db.collection('instagram_posts').findOne({ _id: postId });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Here you would implement the logic to fetch real-time metrics
    // This could be through a third-party service or your own scraping solution
    // For now, we'll simulate with random increases
    
    const currentLikes = post.likes || 0;
    const currentComments = post.comments || 0;
    
    // Simulate small random increases (1-3 likes, 0-1 comments)
    const newLikes = currentLikes + Math.floor(Math.random() * 3) + 1;
    const newComments = currentComments + (Math.random() > 0.7 ? 1 : 0);
    
    // Update the database with new metrics
    await db.collection('instagram_posts').updateOne(
      { _id: postId },
      { $set: { likes: newLikes, comments: newComments, lastUpdated: new Date() } }
    );
    
    return NextResponse.json({ 
      likes: newLikes, 
      comments: newComments,
      lastUpdated: new Date()
    });
    
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
} 