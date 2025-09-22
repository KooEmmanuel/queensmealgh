import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Build sort
    let sortObj: any = { createdAt: -1 };
    switch (sort) {
      case 'popular':
        sortObj = { likes: -1, views: -1, createdAt: -1 };
        break;
      case 'trending':
        // Trending: recent posts with high engagement
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: oneDayAgo };
        sortObj = { likes: -1, comments: -1, views: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'most_commented':
        sortObj = { 'comments.length': -1, createdAt: -1 };
        break;
    }
    
    const threads = await db.collection('threads')
      .find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get user information for each thread
    const enrichedThreads = await Promise.all(
      threads.map(async (thread) => {
        const author = await db.collection('community_users').findOne({
          username: thread.author
        });

        // Get comment authors
        const enrichedComments = await Promise.all(
          thread.comments.map(async (comment: any) => {
            const commentAuthor = await db.collection('community_users').findOne({
              username: comment.author
            });

            // Get reply authors
            const enrichedReplies = await Promise.all(
              (comment.replies || []).map(async (reply: any) => {
                const replyAuthor = await db.collection('community_users').findOne({
                  username: reply.author
                });

                return {
                  ...reply,
                  authorDisplayName: replyAuthor?.displayName || reply.author,
                  authorAvatar: replyAuthor?.avatar,
                  authorReputation: replyAuthor?.reputation || 0
                };
              })
            );

            return {
              ...comment,
              authorDisplayName: commentAuthor?.displayName || comment.author,
              authorAvatar: commentAuthor?.avatar,
              authorReputation: commentAuthor?.reputation || 0,
              authorBadges: commentAuthor?.badges || [],
              replies: enrichedReplies
            };
          })
        );

        return {
          ...thread,
          _id: thread._id.toString(),
          authorDisplayName: author?.displayName || thread.author,
          authorAvatar: author?.avatar,
          authorReputation: author?.reputation || 0,
          authorBadges: author?.badges || [],
          comments: enrichedComments
        };
      })
    );

    const total = await db.collection('threads').countDocuments(query);

    return NextResponse.json({
      success: true,
      threads: enrichedThreads,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + threads.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch threads' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { title, content, author, category, tags } = body;

    // Validate required fields
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Title, content, and author are required' },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 5 and 200 characters' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 10 || content.length > 10000) {
      return NextResponse.json(
        { error: 'Content must be between 10 and 10,000 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.collection('community_users').findOne({
      username: author.toLowerCase()
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create new thread
    const newThread = {
      title: title.trim(),
      content: content.trim(),
      author: author.toLowerCase(),
      category: category || 'general',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      views: 0,
      comments: [],
      isPinned: false,
      isLocked: false,
      isArchived: false,
      lastActivity: new Date()
    };

    const result = await db.collection('threads').insertOne(newThread);

    // Update user's post count
    await db.collection('community_users').updateOne(
      { username: author.toLowerCase() },
      { 
        $inc: { postCount: 1 },
        $set: { lastActive: new Date() }
      }
    );

    // Update user's reputation
    await db.collection('community_users').updateOne(
      { username: author.toLowerCase() },
      { $inc: { reputation: 5 } } // 5 points for creating a post
    );

    // Check for reputation badges
    const updatedUser = await db.collection('community_users').findOne({
      username: author.toLowerCase()
    });

    const newBadges = [];
    if (updatedUser.reputation >= 50 && !updatedUser.badges.includes('regular')) {
      newBadges.push('regular');
    }
    if (updatedUser.reputation >= 100 && !updatedUser.badges.includes('veteran')) {
      newBadges.push('veteran');
    }
    if (updatedUser.reputation >= 500 && !updatedUser.badges.includes('expert')) {
      newBadges.push('expert');
    }
    if (updatedUser.reputation >= 1000 && !updatedUser.badges.includes('legend')) {
      newBadges.push('legend');
    }

    if (newBadges.length > 0) {
      await db.collection('community_users').updateOne(
        { username: author.toLowerCase() },
        { $push: { badges: { $each: newBadges } } }
      );
    }

    return NextResponse.json({
      success: true,
      thread: {
        _id: result.insertedId.toString(),
        ...newThread
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create thread' 
      },
      { status: 500 }
    );
  }
}