import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ImageRequest {
  prompt: string;
  type: 'featured' | 'blog';
  cuisine?: string;
  style?: 'photographic' | 'artistic' | 'minimalist' | 'vibrant';
  aspectRatio?: 'square' | 'landscape' | 'portrait';
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequest = await request.json();
    const { 
      prompt, 
      type, 
      cuisine = 'Ghanaian', 
      style = 'photographic',
      aspectRatio = 'landscape'
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Image prompt is required' },
        { status: 400 }
      );
    }

    // Generate enhanced prompt based on parameters
    const enhancedPrompt = generateEnhancedPrompt(prompt, type, cuisine, style, aspectRatio);
    
    // For now, we'll return a placeholder image URL
    // In a real implementation, you would integrate with an AI image generation service
    // like DALL-E, Midjourney, or Stable Diffusion
    const imageUrl = await generatePlaceholderImage(enhancedPrompt, type);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      metadata: {
        type,
        cuisine,
        style,
        aspectRatio
      }
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

function generateEnhancedPrompt(
  basePrompt: string, 
  type: string, 
  cuisine: string, 
  style: string, 
  aspectRatio: string
): string {
  const styleDescriptors = {
    'photographic': 'professional food photography, high quality, detailed, appetizing',
    'artistic': 'artistic food styling, creative composition, beautiful presentation',
    'minimalist': 'clean, minimalist food styling, simple composition, elegant',
    'vibrant': 'vibrant colors, energetic composition, bold presentation'
  };

  const aspectDescriptors = {
    'square': 'square composition, balanced framing',
    'landscape': 'wide composition, horizontal framing',
    'portrait': 'vertical composition, tall framing'
  };

  const typeDescriptors = {
    'featured': 'hero image, main dish presentation, center stage',
    'blog': 'blog header image, editorial style, informative'
  };

  const cuisineDescriptors = {
    'Ghanaian': 'traditional Ghanaian cuisine, authentic presentation, cultural elements',
    'Nigerian': 'traditional Nigerian cuisine, authentic presentation, cultural elements',
    'West African': 'West African cuisine, traditional presentation, cultural heritage'
  };

  const styleDesc = styleDescriptors[style as keyof typeof styleDescriptors] || styleDescriptors['photographic'];
  const aspectDesc = aspectDescriptors[aspectRatio as keyof typeof aspectDescriptors] || aspectDescriptors['landscape'];
  const typeDesc = typeDescriptors[type as keyof typeof typeDescriptors] || typeDescriptors['featured'];
  const cuisineDesc = cuisineDescriptors[cuisine as keyof typeof cuisineDescriptors] || cuisineDescriptors['Ghanaian'];

  return `${basePrompt}, ${cuisineDesc}, ${typeDesc}, ${styleDesc}, ${aspectDesc}, food photography, appetizing, delicious, high resolution, professional lighting`;
}

async function generatePlaceholderImage(prompt: string, type: string): Promise<string> {
  try {
    // Use DALL-E to generate the image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: type === 'featured' ? "1024x1024" : "1792x1024", // Square for featured, landscape for blog
      quality: "standard",
      style: "natural"
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return imageUrl;

  } catch (error) {
    console.error('DALL-E API error:', error);
    // Fallback to placeholder images
    const placeholderImages = {
      'featured': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop&crop=center',
      'blog': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop&crop=center'
    };

    return placeholderImages[type as keyof typeof placeholderImages] || placeholderImages['featured'];
  }
}

// Alternative implementation using a real AI service (example with OpenAI DALL-E)
async function generateImageWithOpenAI(prompt: string): Promise<string> {
  try {
    // This would require OpenAI API key and proper setup
    /*
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      })
    });

    const data = await response.json();
    return data.data[0].url;
    */
    
    // Placeholder return
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop&crop=center';
  } catch (error) {
    console.error('Error generating image with OpenAI:', error);
    throw error;
  }
}