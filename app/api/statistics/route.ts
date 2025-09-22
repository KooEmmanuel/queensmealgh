import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get recipe count from featured_content collection (where recipes are stored)
    const recipeCount = await db.collection('featured_content').countDocuments();
    
    // Get community members count from community_users collection
    const communityCount = await db.collection('community_users').countDocuments();
    
    // Get total views from featured_content (sum of view counts)
    const recipesWithViews = await db.collection('featured_content').aggregate([
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