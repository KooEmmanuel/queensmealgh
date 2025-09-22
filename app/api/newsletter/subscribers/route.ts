import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Get all newsletter subscribers
    const subscribers = await db.collection('newsletter_subscriptions')
      .find({})
      .sort({ subscribedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      subscribers: subscribers.map(sub => ({
        _id: sub._id.toString(),
        email: sub.email,
        name: sub.name || '',
        status: sub.status || 'active',
        subscribedAt: sub.subscribedAt || sub.createdAt || new Date().toISOString(),
        source: sub.source || 'website'
      }))
    });

  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch subscribers' 
      },
      { status: 500 }
    );
  }
}