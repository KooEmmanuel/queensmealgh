import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

let lastFetchTime = 0;
const RATE_LIMIT_MS = 5000; // 5 seconds

// GET - Fetch all Instagram posts
export async function GET(request: Request) {
  try {
    // Log the request URL and referrer to identify the source
    const url = new URL(request.url);
    const referrer = request.headers.get('referer') || 'unknown';
    console.log(`Instagram API request from: ${referrer}, query: ${url.search}`);
    
    // Implement rate limiting
    const now = Date.now();
    if (now - lastFetchTime < RATE_LIMIT_MS) {
      // Return cached response or 429 Too Many Requests
      return NextResponse.json(
        { message: 'Rate limited. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Update last fetch time
    lastFetchTime = now;
    
    // Add cache control headers to the response
    const headers = new Headers({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    const { db } = await connectToDatabase();
    
    // Add proper error handling for database connection
    if (!db) {
      console.error('Failed to connect to database');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500, headers }
      );
    }
    
    try {
      const posts = await db.collection('instagram_posts')
        .find({})
        .sort({ timestamp: -1 })
        .toArray();
      
      // Log the number of posts found to help debug
      console.log(`Found ${posts.length} Instagram posts`);
      
      // Return with cache control headers
      return NextResponse.json(posts, { headers });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: 'Failed to query database' },
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Instagram posts' },
      { status: 500 }
    );
  }
}

// POST - Add a new Instagram post
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const postUrl = formData.get('postUrl') as string;
    const caption = formData.get('caption') as string;
    const isPlayable = formData.get('isPlayable') === 'true';
    
    // Handle image upload
    let thumbnailBase64 = '';
    const image = formData.get('image') as File;
    
    if (image && image.size > 0) {
      try {
        // Convert image to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        thumbnailBase64 = `data:${image.type};base64,${buffer.toString('base64')}`;
        console.log('Image converted to base64 successfully');
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        // Continue without the image
      }
    }
    
    const { db } = await connectToDatabase();
    
    // Generate a default placeholder if no image was provided
    const defaultThumbnail = '/images/placeholder-instagram.jpg';
    
    const result = await db.collection('instagram_posts').insertOne({
      postUrl,
      caption,
      // Use base64 image if available, otherwise use placeholder
      thumbnail: thumbnailBase64 || defaultThumbnail,
      likes: Math.floor(Math.random() * 50) + 30, // Random initial likes
      comments: Math.floor(Math.random() * 10) + 5, // Random initial comments
      timestamp: new Date().toISOString(),
      isPlayable,
      createdAt: new Date()
    });
    
    // Fetch the created post to verify it was stored correctly
    const createdPost = await db.collection('instagram_posts').findOne({ 
      _id: result.insertedId 
    });
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      post: createdPost
    });
  } catch (error) {
    console.error('Error adding Instagram post:', error);
    return NextResponse.json(
      { error: 'Failed to add Instagram post' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an Instagram post
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('instagram_posts').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Instagram post:', error);
    return NextResponse.json(
      { error: 'Failed to delete Instagram post' },
      { status: 500 }
    );
  }
}

// PUT - Update an Instagram post
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    const postUrl = formData.get('postUrl') as string;
    const caption = formData.get('caption') as string;
    const isPlayable = formData.get('isPlayable') === 'true';
    
    // Handle image upload
    let thumbnailBase64 = '';
    const image = formData.get('image') as File;
    
    if (image && image.size > 0) {
      try {
        // Convert image to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        thumbnailBase64 = `data:${image.type};base64,${buffer.toString('base64')}`;
        console.log('Image converted to base64 successfully');
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        // Continue without the image
      }
    }
    
    const { db } = await connectToDatabase();
    
    // Prepare update object
    const updateData: any = {
      postUrl,
      caption,
      isPlayable,
      updatedAt: new Date()
    };
    
    // Only update thumbnail if a new one was provided
    if (thumbnailBase64) {
      updateData.thumbnail = thumbnailBase64;
    }
    
    const result = await db.collection('instagram_posts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating Instagram post:', error);
    return NextResponse.json(
      { error: 'Failed to update Instagram post' },
      { status: 500 }
    );
  }
} 