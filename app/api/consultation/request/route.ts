import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const packageType = searchParams.get('packageType');
    const budgetRange = searchParams.get('budgetRange');
    const urgency = searchParams.get('urgency');
    
    // Build query
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (packageType && packageType !== 'all') query.packageType = packageType;
    if (budgetRange && budgetRange !== 'all') query.budgetRange = budgetRange;
    if (urgency && urgency !== 'all') query.urgency = urgency;
    
    const requests = await db.collection('consultation_requests')
      .find(query)
      .sort({ requestDate: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      requests: requests.map(request => ({
        ...request,
        _id: request._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching consultation requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch consultation requests' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    const body = await request.json();
    const {
      // Personal Information
      fullName,
      email,
      phone,
      
      // Business Information
      businessName,
      businessType,
      businessSize,
      website,
      
      // Content Needs
      contentType,
      platforms,
      currentContent,
      contentGoals,
      
      // Budget and Timeline
      budgetRange,
      timeline,
      urgency,
      
      // Additional Information
      specificRequirements,
      previousExperience,
      questions,
      
      // System fields
      packageType,
      requestDate
    } = body;

    // Validate required fields (only essential contact information is required)
    if (!fullName || !email) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: fullName and email are required' 
        },
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

    // Create consultation request
    const requestData = {
      // Personal Information
      fullName,
      email,
      phone: phone || '',
      
      // Business Information
      businessName,
      businessType,
      businessSize: businessSize || '',
      website: website || '',
      
      // Content Needs
      contentType,
      platforms: platforms || [],
      currentContent: currentContent || '',
      contentGoals,
      
      // Budget and Timeline
      budgetRange,
      timeline: timeline || '',
      urgency: urgency || '',
      
      // Additional Information
      specificRequirements: specificRequirements || '',
      previousExperience: previousExperience || '',
      questions: questions || '',
      
      // System fields
      packageType,
      requestDate: new Date(requestDate),
      status: 'new',
      priority: urgency === 'very-urgent' ? 'high' : urgency === 'urgent' ? 'medium' : 'low',
      assignedTo: null,
      notes: '',
      followUpDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('consultation_requests').insertOne(requestData);

    // In a real application, you might want to:
    // 1. Send email notifications to admin
    // 2. Send confirmation email to client
    // 3. Add to CRM system
    // 4. Create calendar reminder for follow-up

    return NextResponse.json({
      success: true,
      message: 'Consultation request submitted successfully',
      requestId: result.insertedId.toString()
    });

  } catch (error) {
    console.error('Error creating consultation request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create consultation request' 
      },
      { status: 500 }
    );
  }
}