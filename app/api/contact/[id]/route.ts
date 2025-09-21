import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { status } = body;
    
    if (!status || !['new', 'in-progress', 'completed', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('contact_submissions').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          status,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      id,
      status
    });
  } catch (error) {
    console.error('Error updating contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to update contact submission' },
      { status: 500 }
    );
  }
} 