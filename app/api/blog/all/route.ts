import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const blogPosts = await db.collection('blogPosts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    if (!blogPosts || blogPosts.length === 0) {
      return NextResponse.json({ message: 'No blog posts found', posts: [] });
    }
    
    const formattedPosts = blogPosts.map((post: any) => {
      try {
        if (typeof post.content === 'string') {
          return {
            ...post,
            content: JSON.parse(post.content)
          };
        }
        return post;
      } catch (e) {
        console.error(`Error parsing content for post ${post._id}:`, e);
        return post;
      }
    });
    
    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
} 