import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const formData = await request.formData();
    
    const photo = formData.get('photo') as File;
    const userId = formData.get('userId') as string;

    if (!photo || !userId) {
      return NextResponse.json(
        { error: 'Photo and user ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.collection('community_users').findOne({
      _id: new ObjectId(userId)
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = photo.name.split('.').pop() || 'jpg';
    const filename = `${userId}_${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate public URL
    const photoUrl = `/uploads/profiles/${filename}`;

    // Update user's avatar in database
    await db.collection('community_users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          avatar: photoUrl,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({
      success: true,
      photoUrl: photoUrl,
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload photo' 
      },
      { status: 500 }
    );
  }
}