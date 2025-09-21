import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid blog post ID' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const post = await db.collection('blogPosts').findOne({
      _id: new ObjectId(id)
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Parse the content if it's stored as a string
    if (typeof post.content === 'string') {
      try {
        post.content = JSON.parse(post.content);
      } catch (e) {
        console.error(`Error parsing content for post ${id}:`, e);
      }
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid blog post ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, excerpt, content, imageUrl, category, author, tags, publishNow, updatedAt } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!content || !content.blocks) {
       return NextResponse.json({ error: 'Content is required and must be in Editor.js format' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const updateData: any = {
      title,
      excerpt: excerpt || '',
      content: JSON.stringify(content),
      coverImage: imageUrl || '',
      category: category || 'Uncategorized',
      author: author || { name: 'Admin', avatar: '' },
      tags: tags || [],
      status: publishNow ? 'published' : 'draft',
      updatedAt: updatedAt || new Date().toISOString()
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const result = await db.collection('blogPosts').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateData
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const updatedPost = await db.collection('blogPosts').findOne({ _id: new ObjectId(id) });

    if (updatedPost && typeof updatedPost.content === 'string') {
        try {
          updatedPost.content = JSON.parse(updatedPost.content);
        } catch (e) {
          console.error(`Error parsing content for updated post ${id}:`, e);
        }
      }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid blog post ID' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('blogPosts').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
} 