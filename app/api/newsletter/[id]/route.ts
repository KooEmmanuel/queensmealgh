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
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    const newsletter = await db.collection('newsletters')
      .findOne({ _id: new ObjectId(id) });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      newsletter: {
        ...newsletter,
        _id: newsletter._id.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch newsletter' 
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
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { subject, previewText, content, tags, status } = body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (subject) updateData.subject = subject;
    if (previewText !== undefined) updateData.previewText = previewText;
    if (content) updateData.content = content;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;

    const result = await db.collection('newsletters')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter updated successfully'
    });

  } catch (error) {
    console.error('Error updating newsletter:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update newsletter' 
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
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    const result = await db.collection('newsletters')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting newsletter:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete newsletter' 
      },
      { status: 500 }
    );
  }
}