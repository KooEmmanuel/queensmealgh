import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // For now, return basic link data
    // In a production app, you might want to fetch the page and extract meta data
    return NextResponse.json({
      success: 1,
      link: url,
      meta: {
        title: url,
        description: '',
        image: {
          url: ''
        }
      }
    });

  } catch (error) {
    console.error('Error processing link preview:', error);
    return NextResponse.json(
      { error: 'Failed to process link' },
      { status: 500 }
    );
  }
}