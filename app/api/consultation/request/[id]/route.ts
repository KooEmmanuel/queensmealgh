import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const consultationRequest = await db.collection('consultation_requests')
      .findOne({ _id: new ObjectId(id) });

    if (!consultationRequest) {
      return NextResponse.json(
        { error: 'Consultation request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: {
        ...consultationRequest,
        _id: consultationRequest._id.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching consultation request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch consultation request' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, priority, assignedTo, notes, followUpDate } = body;

    // Validate status if provided
    if (status && !['new', 'contacted', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: new, contacted, in-progress, completed, cancelled' },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be: low, medium, high' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (notes !== undefined) updateData.notes = notes;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);

    const result = await db.collection('consultation_requests')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Consultation request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Consultation request updated successfully'
    });

  } catch (error) {
    console.error('Error updating consultation request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update consultation request' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const result = await db.collection('consultation_requests')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Consultation request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Consultation request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting consultation request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete consultation request' 
      },
      { status: 500 }
    );
  }
}