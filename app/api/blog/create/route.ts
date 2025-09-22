import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Ensure content is properly formatted
    if (!body.content || !body.content.blocks) {
      return NextResponse.json(
        { error: 'Content is required and must be in Editor.js format' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Prepare the blog post data
    const blogPost = {
      title: body.title,
      excerpt: body.excerpt || '',
      // Store content as a JSON string to ensure compatibility
      content: JSON.stringify(body.content),
      coverImage: body.coverImage || '',
      category: body.category || 'Uncategorized',
      author: body.author || { name: 'Admin', avatar: '' },
      tags: body.tags || [],
      status: body.publishNow ? 'published' : 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert the blog post
    const result = await db.collection('blog_posts').insertOne(blogPost);
    
    // Return the created blog post with its ID
    return NextResponse.json({
      _id: result.insertedId,
      ...blogPost
    });
    
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
} 