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
          content: `Create a blog post about "${title}" related to ${topic}. 

Please provide a JSON response with the following structure:
{
  "excerpt": "Compelling excerpt (2-3 sentences)",
  "content": {
    "blocks": [
      {
        "type": "header",
        "data": {
          "text": "Header text",
          "level": 2
        }
      },
      {
        "type": "paragraph", 
        "data": {
          "text": "Paragraph content"
        }
      },
      {
        "type": "list",
        "data": {
          "style": "unordered",
          "items": ["Item 1", "Item 2", "Item 3"]
        }
      }
    ]
  },
  "imagePrompt": "A beautiful food photograph related to the blog post"
}

Create engaging content with proper EditorJS block structure including headers, paragraphs, and lists. Make it informative and well-structured.`
        }
      ],
      temperature: 0.7,
    });
    
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }
    
    // Parse the JSON response
    const generatedContent = JSON.parse(content);
    
    // Validate and fix the content structure
    const validatedContent = validateAndFixEditorJsContent(generatedContent.content);
    
    return NextResponse.json({
      excerpt: generatedContent.excerpt,
      content: validatedContent,
      imagePrompt: generatedContent.imagePrompt
    });
  } catch (error) {
    console.error('Error generating blog content:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog content' },
      { status: 500 }
    );
  }
}

// Validate and fix EditorJS content structure
function validateAndFixEditorJsContent(content: any): any {
  if (!content || typeof content !== 'object') {
    console.warn('Invalid content structure, creating fallback');
    return { blocks: [] };
  }

  if (!Array.isArray(content.blocks)) {
    console.warn('Content blocks is not an array, creating fallback');
    return { blocks: [] };
  }

  // Validate and fix each block
  const validatedBlocks = content.blocks.map((block: any, index: number) => {
    if (!block || typeof block !== 'object') {
      console.warn(`Invalid block at index ${index}, skipping`);
      return null;
    }

    // Ensure block has required fields
    const validatedBlock = {
      id: block.id || `block-${index}-${Date.now()}`,
      type: block.type || 'paragraph',
      data: block.data || {}
    };

    // Validate specific block types
    switch (validatedBlock.type) {
      case 'header':
        if (!validatedBlock.data.text) {
          validatedBlock.data.text = 'Untitled Header';
        }
        if (!validatedBlock.data.level || validatedBlock.data.level < 1 || validatedBlock.data.level > 6) {
          validatedBlock.data.level = 2;
        }
        break;
      
      case 'paragraph':
        if (!validatedBlock.data.text) {
          validatedBlock.data.text = 'Empty paragraph';
        }
        break;
      
      case 'list':
        if (!Array.isArray(validatedBlock.data.items)) {
          validatedBlock.data.items = [];
        }
        if (!validatedBlock.data.style || !['ordered', 'unordered'].includes(validatedBlock.data.style)) {
          validatedBlock.data.style = 'unordered';
        }
        break;
      
      case 'quote':
        if (!validatedBlock.data.text) {
          validatedBlock.data.text = 'Empty quote';
        }
        break;
      
      default:
        // For unknown block types, convert to paragraph
        if (!validatedBlock.data.text) {
          validatedBlock.data.text = 'Content block';
        }
        validatedBlock.type = 'paragraph';
        break;
    }

    return validatedBlock;
  }).filter((block: any) => block !== null);

  return {
    blocks: validatedBlocks
  };
}
