import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { title, description, imageBase64, ingredients, instructions } = body;
    
    if (!title || !imageBase64) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('featured_content').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          title,
          description: description || '',
          imageBase64,
          ingredients: ingredients || [],
          instructions: instructions || [],
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Featured content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      _id: id,
      title,
      description: description || '',
      imageBase64,
      ingredients: ingredients || [],
      instructions: instructions || [],
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating featured content:', error);
    return NextResponse.json(
      { error: 'Failed to update featured content' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const recipe = await db.collection('featured_content').findOne({
      _id: new ObjectId(id)
    });
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
} 