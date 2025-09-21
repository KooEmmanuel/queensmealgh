import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// IMPORTANT: Add authentication/authorization checks here in a real app
// to ensure only logged-in admins can access this data.

export async function GET(request: Request) {
  // Example: Check for an admin session or token before proceeding
  // const isAdmin = await checkAdminAuth(request);
  // if (!isAdmin) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('newsletter_subscriptions');

    const subscriptions = await collection
      .find({})
      .sort({ subscribedAt: -1 }) // Sort by newest first
      .toArray();

    // Convert ObjectId to string if necessary for client-side rendering
    const sanitizedSubscriptions = subscriptions.map((sub: any) => ({
        ...sub,
        _id: sub._id.toString(),
    }));


    return NextResponse.json(sanitizedSubscriptions, { status: 200 });

  } catch (error: any) {
    console.error('Admin Fetch Newsletter Error:', error);
    return NextResponse.json({ message: 'Internal Server Error fetching subscriptions.' }, { status: 500 });
  }
} 