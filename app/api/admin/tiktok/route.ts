import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all TikTok videos
export async function GET(request: Request) {
  try {
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
      const videos = await db.collection('tiktok_videos')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      // Log the number of videos found to help debug
      console.log(`Found ${videos.length} TikTok videos`);
      
      // Return with cache control headers
      return NextResponse.json(videos, { headers });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: 'Failed to query database' },
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('Error fetching TikTok videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TikTok videos' },
      { status: 500 }
    );
  }
}

// POST - Add a new TikTok video
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const videoUrl = formData.get('videoUrl') as string;
    const title = formData.get('title') as string;
    const views = formData.get('views') as string;
    const duration = formData.get('duration') as string;
    const isPlayable = formData.get('isPlayable') === 'true';
    
    // Handle image upload
    let thumbnailBase64 = '';
    const image = formData.get('image') as File;
    
    if (image) {
      // Convert image to base64
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      thumbnailBase64 = `data:${image.type};base64,${buffer.toString('base64')}`;
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('tiktok_videos').insertOne({
      videoUrl,
      title,
      // Store the image directly as base64 in the database
      thumbnail: thumbnailBase64 || '/images/placeholder-tiktok.jpg',
      views: views || '0',
      duration: duration || '0:00',
      isPlayable,
      createdAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error adding TikTok video:', error);
    return NextResponse.json(
      { error: 'Failed to add TikTok video' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a TikTok video
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('tiktok_videos').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting TikTok video:', error);
    return NextResponse.json(
      { error: 'Failed to delete TikTok video' },
      { status: 500 }
    );
  }
}

// PUT - Update a TikTok video
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    const videoUrl = formData.get('videoUrl') as string;
    const title = formData.get('title') as string;
    const views = formData.get('views') as string;
    const duration = formData.get('duration') as string;
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
      videoUrl,
      title,
      views,
      duration,
      isPlayable,
      updatedAt: new Date()
    };
    
    // Only update thumbnail if a new one was provided
    if (thumbnailBase64) {
      updateData.thumbnail = thumbnailBase64;
    }
    
    const result = await db.collection('tiktok_videos').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating TikTok video:', error);
    return NextResponse.json(
      { error: 'Failed to update TikTok video' },
      { status: 500 }
    );
  }
} 