import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get recipe count from recipes collection
    const recipeCount = await db.collection('recipes').countDocuments();
    
    // Get community members count from community collection
    const communityCount = await db.collection('community').countDocuments();
    
    // Get unique countries from ratings
    const countriesData = await db.collection('recipe_ratings').aggregate([
      {
        $group: {
          _id: '$country'
        }
      }
    ]).toArray();
    
    const countriesCount = countriesData.length;
    
    // Get total views from recipes (sum of view counts)
    const recipesWithViews = await db.collection('recipes').aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: { $ifNull: ['$views', 0] } }
        }
      }
    ]).toArray();
    
    const totalViews = recipesWithViews.length > 0 ? recipesWithViews[0].totalViews : 0;
    
    // Get TikTok posts count for additional content
    const tiktokCount = await db.collection('tiktok_videos').countDocuments();
    
    // Get blog posts count
    const blogCount = await db.collection('blog_posts').countDocuments();
    
    const statistics = {
      recipes: recipeCount,
      communityMembers: communityCount,
      countries: countriesCount, // Will be updated when ratings are implemented
      totalViews: totalViews,
      tiktokPosts: tiktokCount,
      blogPosts: blogCount,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}