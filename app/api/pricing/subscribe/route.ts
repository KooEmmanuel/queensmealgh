import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const packageType = searchParams.get('packageType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (packageType) query.packageType = packageType;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get subscriptions
    const subscriptions = await db.collection('pricingsubscriptions')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const total = await db.collection('pricingsubscriptions').countDocuments(query);

    return NextResponse.json({
      success: true,
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    const body = await request.json();
    const { customerName, customerEmail, customerPhone, packageType, paymentMethod, notes } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !packageType) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerEmail, packageType' },
        { status: 400 }
      );
    }

    // Validate package type
    if (!['weekly', 'monthly'].includes(packageType)) {
      return NextResponse.json(
        { error: 'Invalid package type. Must be "weekly" or "monthly"' },
        { status: 400 }
      );
    }

    // Set pricing based on package type
    const pricing = {
      weekly: 3000,
      monthly: 5000
    };

    const amount = pricing[packageType as keyof typeof pricing];

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    
    if (packageType === 'weekly') {
      endDate.setDate(startDate.getDate() + 7);
    } else {
      endDate.setMonth(startDate.getMonth() + 1);
    }

    // Create new subscription
    const subscriptionData = {
      customerName,
      customerEmail,
      customerPhone,
      packageType,
      amount,
      startDate,
      endDate,
      paymentMethod,
      notes,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('pricingsubscriptions').insertOne(subscriptionData);

    // In a real application, you would integrate with a payment gateway here
    // For now, we'll simulate a successful payment
    await db.collection('pricingsubscriptions').updateOne(
      { _id: result.insertedId },
      { 
        $set: { 
          paymentStatus: 'paid',
          status: 'active',
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Subscription created successfully',
      subscription: {
        id: result.insertedId,
        customerName,
        customerEmail,
        packageType,
        amount,
        status: 'active',
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}