import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch featured content
export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get the most recent featured item
    const featuredItem = await db.collection('featured_content')
      .findOne({}, { sort: { createdAt: -1 } });
    
    if (!featuredItem) {
      return NextResponse.json({ 
        error: 'No featured content found' 
      }, { status: 404 });
    }
    
    return NextResponse.json(featuredItem);
  } catch (error) {
    console.error('Error fetching featured content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured content' },
      { status: 500 }
    );
  }
}

// POST - Create or update featured content (for admin use)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, imageBase64, ingredients, instructions } = body;
    
    console.log("Received data:", { 
      title, 
      description: description?.substring(0, 20) + "...", 
      imageBase64: imageBase64?.substring(0, 20) + "...",
      ingredients,
      instructions
    });
    
    if (!title || !imageBase64) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }
    
    // Validate base64 image
    if (!imageBase64.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('featured_content').insertOne({
      title,
      description: description || '',
      imageBase64,
      ingredients: ingredients || [],
      instructions: instructions || [],
      createdAt: new Date()
    });
    
    return NextResponse.json({
      _id: result.insertedId,
      title,
      description: description || '',
      imageBase64,
      ingredients: ingredients || [],
      instructions: instructions || [],
      createdAt: new Date()
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating featured content:', error);
    return NextResponse.json(
      { error: 'Failed to create featured content' },
      { status: 500 }
    );
  }
}

// DELETE - Remove featured content
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('featured_content').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Featured content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting featured content:', error);
    return NextResponse.json(
      { error: 'Failed to delete featured content' },
      { status: 500 }
    );
  }
} 