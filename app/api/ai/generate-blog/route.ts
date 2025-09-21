import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, topic, tone } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional food blogger and recipe expert. Write engaging, informative content in a ${tone} tone.`
        },
        {
          role: "user",
          content: `Create a blog post about "${title}" related to ${topic}. Include:
          1. A catchy excerpt (2-3 sentences)
          2. A full blog post with proper HTML formatting (use <h2>, <p>, <ul>, <ol>, etc.)
          3. A prompt for generating an image that would complement this post`
        }
      ],
      temperature: 0.7,
    });
    
    const content = completion.choices[0].message.content;
    
    // Parse the content to extract parts
    const parts = parseGeneratedContent(content);
    
    return NextResponse.json({
      excerpt: parts.excerpt,
      content: parts.content,
      imagePrompt: parts.imagePrompt
    });
  } catch (error) {
    console.error('Error generating blog content:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog content' },
      { status: 500 }
    );
  }
}

function parseGeneratedContent(content: string) {
  // Simple parsing logic - can be enhanced based on actual output format
  const excerptMatch = content.match(/Excerpt:(.*?)(?=Full Blog Post:|$)/s);
  const contentMatch = content.match(/Full Blog Post:(.*?)(?=Image Prompt:|$)/s);
  const imagePromptMatch = content.match(/Image Prompt:(.*?)$/s);
  
  return {
    excerpt: excerptMatch ? excerptMatch[1].trim() : '',
    content: contentMatch ? contentMatch[1].trim() : content,
    imagePrompt: imagePromptMatch ? imagePromptMatch[1].trim() : 'A beautiful food photograph related to the blog post'
  };
} 