import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('newsletter_subscriptions');
    
    const subscribers = await collection.find({}).toArray();
    
    return NextResponse.json(subscribers, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json({ message: 'Failed to fetch newsletter subscribers' }, { status: 500 });
  }
}

// Basic email validation regex (more robust than client-side)
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !validateEmail(email)) {
      return NextResponse.json({ message: 'Invalid email address provided.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('newsletter_subscriptions');

    // Check if email already exists
    const existingSubscription = await collection.findOne({ email: email.toLowerCase() });
    if (existingSubscription) {
      return NextResponse.json({ message: 'Email already subscribed.' }, { status: 409 }); // 409 Conflict
    }

    // Insert new subscription
    const result = await collection.insertOne({
      email: email.toLowerCase(),
      subscribedAt: new Date(),
    });

    if (result.acknowledged) {
      return NextResponse.json({ message: 'Successfully subscribed to newsletter!' }, { status: 201 }); // 201 Created
    } else {
      throw new Error('Failed to insert subscription into database.');
    }

  } catch (error: any) {
    console.error('Newsletter Subscription Error:', error);
    // Distinguish between known errors and general server errors
    if (error.message.includes('duplicate key')) { // Example specific error check
         return NextResponse.json({ message: 'Email already subscribed.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal Server Error during subscription.' }, { status: 500 });
  }
} 