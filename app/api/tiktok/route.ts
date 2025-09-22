import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET - Fetch TikTok videos for public display
export async function GET(request: Request) {
  try {
    // Get category from query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '1';
    
    // Add cache control headers
    const headers = new Headers({
      'Cache-Control': 'public, max-age=300, s-maxage=600', // Cache for 5 minutes on client, 10 minutes on CDN
    });

    const { db } = await connectToDatabase();
    
    if (!db) {
      console.error('Failed to connect to database');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500, headers }
      );
    }
    
    try {
      // Build query based on category
      let query: any = { isPlayable: true };
      let sort: any = { createdAt: -1 }; // Default sort by newest
      
      // Apply category filters
      if (category === '4') { // Breakfast
        query.title = { $regex: 'breakfast|morning|akara|pap', $options: 'i' };
      } else if (category === '5') { // Dinner
        query.title = { $regex: 'dinner|evening|soup|stew', $options: 'i' };
      } else if (category === '6') { // Quick Meals
        query.title = { $regex: 'quick|easy|fast|minutes', $options: 'i' };
      } else if (category === '1') { // Popular - sort by views
        sort = { views: -1 };
      }
      // category '2' is Recent, which is the default sort
      
      // Fetch videos with category filtering
      const videos = await db.collection('tiktok_videos')
        .find(query)
        .sort(sort)
        .limit(8) // Limit to 8 videos
        .toArray();
      
      console.log(`Found ${videos.length} TikTok videos for category ${category}`);
      
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