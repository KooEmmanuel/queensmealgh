import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Add a rating to a recipe
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const recipeId = resolvedParams.id;
    
    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, userId, userName } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if recipe exists
    const recipe = await db.collection('featured_content').findOne({
      _id: new ObjectId(recipeId)
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Create rating object
    const ratingData = {
      recipeId: new ObjectId(recipeId),
      rating: parseInt(rating),
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      createdAt: new Date().toISOString()
    };

    // Insert rating
    const result = await db.collection('recipe_ratings').insertOne(ratingData);

    // Update recipe with new average rating
    const ratings = await db.collection('recipe_ratings')
      .find({ recipeId: new ObjectId(recipeId) })
      .toArray();

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    const totalRatings = ratings.length;

    // Update recipe with new rating data
    await db.collection('featured_content').updateOne(
      { _id: new ObjectId(recipeId) },
      {
        $set: {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalRatings: totalRatings,
          lastRated: new Date().toISOString()
        }
      }
    );

    return NextResponse.json({
      success: true,
      rating: ratingData,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: totalRatings
    });

  } catch (error) {
    console.error('Error adding rating:', error);
    return NextResponse.json(
      { error: 'Failed to add rating' },
      { status: 500 }
    );
  }
}

// GET - Get ratings for a recipe
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const recipeId = resolvedParams.id;
    
    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Get all ratings for this recipe
    const ratings = await db.collection('recipe_ratings')
      .find({ recipeId: new ObjectId(recipeId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate statistics
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: ratings.filter(r => r.rating === star).length,
      percentage: totalRatings > 0 
        ? (ratings.filter(r => r.rating === star).length / totalRatings) * 100 
        : 0
    }));

    return NextResponse.json({
      ratings,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}