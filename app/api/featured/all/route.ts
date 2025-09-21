import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET - Fetch all featured content (for admin)
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const recipes = await db.collection('featured_content')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
} 