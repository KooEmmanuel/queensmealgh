import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { threadId, reporterId, reason } = body;

    // Validate required fields
    if (!threadId || !reporterId || !reason) {
      return NextResponse.json(
        { error: 'Thread ID, reporter ID, and reason are required' },
        { status: 400 }
      );
    }

    // Check if thread exists
    const thread = await db.collection('threads').findOne({
      _id: new ObjectId(threadId)
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Check if user exists
    const reporter = await db.collection('community_users').findOne({
      _id: new ObjectId(reporterId)
    });

    if (!reporter) {
      return NextResponse.json(
        { error: 'Reporter not found' },
        { status: 404 }
      );
    }

    // Check if user has already reported this thread
    const existingReport = await db.collection('reports').findOne({
      threadId: new ObjectId(threadId),
      reporterId: new ObjectId(reporterId)
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this thread' },
        { status: 400 }
      );
    }

    // Create report
    const report = {
      threadId: new ObjectId(threadId),
      reporterId: new ObjectId(reporterId),
      reason,
      status: 'pending',
      createdAt: new Date(),
      threadTitle: thread.title,
      threadAuthor: thread.author,
      reporterUsername: reporter.username
    };

    await db.collection('reports').insertOne(report);

    return NextResponse.json({
      success: true,
      message: 'Thread reported successfully'
    });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create report' 
      },
      { status: 500 }
    );
  }
}