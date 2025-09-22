import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NewsletterRequest {
  topic: string;
  theme: string;
  tone: string;
  targetAudience: string;
  length: string;
  specificContent?: string;
  featuredRecipes?: string;
  seasonalFocus?: string;
  culturalTheme?: string;
  specialEvents?: string;
  callToAction?: string;
  socialMediaFocus?: string;
}

interface NewsletterContent {
  subject: string;
  previewText: string;
  content: {
    hero: {
      title: string;
      subtitle: string;
      imageUrl?: string;
    };
    sections: Array<{
      type: 'text' | 'recipe' | 'tip' | 'story' | 'cta';
      title: string;
      content: string;
      imageUrl?: string;
      ctaText?: string;
      ctaUrl?: string;
    }>;
    footer: {
      message: string;
      socialLinks: Array<{
        platform: string;
        url: string;
      }>;
    };
  };
  tags: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterRequest = await request.json();
    const {
      topic,
      theme,
      tone,
      targetAudience,
      length,
      specificContent,
      featuredRecipes,
      seasonalFocus,
      culturalTheme,
      specialEvents,
      callToAction,
      socialMediaFocus
    } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const newsletterContent = await generateNewsletterContent({
      topic,
      theme,
      tone,
      targetAudience,
      length,
      specificContent,
      featuredRecipes,
      seasonalFocus,
      culturalTheme,
      specialEvents,
      callToAction,
      socialMediaFocus
    });

    return NextResponse.json({
      success: true,
      content: newsletterContent
    });

  } catch (error) {
    console.error('Error generating newsletter:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate newsletter' 
      },
      { status: 500 }
    );
  }
}

async function generateNewsletterContent(params: NewsletterRequest): Promise<NewsletterContent> {
  const {
    topic,
    theme,
    tone,
    targetAudience,
    length,
    specificContent,
    featuredRecipes,
    seasonalFocus,
    culturalTheme,
    specialEvents,
    callToAction,
    socialMediaFocus
  } = params;

  try {
    const systemPrompt = `You are an expert newsletter content creator specializing in African cuisine, particularly Ghanaian food culture. You create engaging, culturally authentic, and visually appealing newsletter content for Queen's Meal. Your responses should be in JSON format only.`;

    // Build enhanced prompt with additional context
    let userPrompt = `Create a complete newsletter about "${topic}" for Queen's Meal.

Newsletter Requirements:
- Theme: ${theme}
- Tone: ${tone}
- Target Audience: ${targetAudience}
- Length: ${length}
- Brand: Queen's Meal (Ghanaian cuisine focus)
- Logo: Available at https://queensmealgh.vercel.app/images/logo.jpeg`;

    // Add optional context
    if (specificContent) {
      userPrompt += `\n- Specific Content to Include: ${specificContent}`;
    }
    if (featuredRecipes) {
      userPrompt += `\n- Featured Recipes: ${featuredRecipes}`;
    }
    if (seasonalFocus) {
      userPrompt += `\n- Seasonal Focus: ${seasonalFocus}`;
    }
    if (culturalTheme) {
      userPrompt += `\n- Cultural Theme: ${culturalTheme}`;
    }
    if (specialEvents) {
      userPrompt += `\n- Special Events: ${specialEvents}`;
    }
    if (callToAction) {
      userPrompt += `\n- Call to Action: ${callToAction}`;
    }
    if (socialMediaFocus) {
      userPrompt += `\n- Social Media Focus: ${socialMediaFocus}`;
    }

    userPrompt += `

Please provide a JSON response with the following structure:
{
  "subject": "Engaging email subject line",
  "previewText": "Preview text that appears in email clients",
  "content": {
    "hero": {
      "title": "Main newsletter title",
      "subtitle": "Engaging subtitle",
      "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop"
    },
    "sections": [
      {
        "type": "text",
        "title": "Section title",
        "content": "Section content with engaging text about the topic",
        "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=300&fit=crop"
      },
      {
        "type": "recipe",
        "title": "Recipe title",
        "content": "Recipe description and instructions",
        "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=300&fit=crop"
      },
      {
        "type": "tip",
        "title": "Cooking tip title",
        "content": "Helpful cooking tip or technique",
        "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=300&fit=crop"
      },
      {
        "type": "cta",
        "title": "Call to action title",
        "content": "Engaging call to action content",
        "ctaText": "Button text",
        "ctaUrl": "https://queensmealgh.vercel.app"
      }
    ],
    "footer": {
      "message": "Thank you for being part of the Queen's Meal family!",
      "socialLinks": [
        {
          "platform": "Instagram",
          "url": "https://instagram.com/queens_meal"
        },
        {
          "platform": "TikTok",
          "url": "https://tiktok.com/@queens_meal"
        }
      ]
    }
  },
  "tags": ["tag1", "tag2", "tag3"]
}

Create ${length} length content with ${tone} tone. Make it engaging and informative for ${targetAudience}. Focus on Ghanaian cuisine and African food culture. Include authentic recipes, cooking tips, and cultural insights.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const generatedContent = JSON.parse(content);
    return {
      subject: generatedContent.subject,
      previewText: generatedContent.previewText,
      content: generatedContent.content,
      tags: generatedContent.tags
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to template-based generation
    return generateNewsletterContentFallback(topic, theme, tone, length);
  }
}

// Fallback function for when OpenAI API fails
async function generateNewsletterContentFallback(
  topic: string,
  theme: string,
  tone: string,
  length: string
): Promise<NewsletterContent> {
  const sectionCount = length === 'short' ? 2 : length === 'medium' ? 4 : 6;
  
  const sections = [];
  for (let i = 0; i < sectionCount; i++) {
    sections.push({
      type: i === 0 ? 'text' : i === 1 ? 'recipe' : i === 2 ? 'tip' : 'text',
      title: `Section ${i + 1}: ${topic}`,
      content: `This is a ${tone} section about ${topic}. Learn more about Ghanaian cuisine and cooking techniques.`,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=300&fit=crop'
    });
  }

  return {
    subject: `${theme} Newsletter: ${topic}`,
    previewText: `Discover amazing ${topic} content in this month's Queen's Meal newsletter`,
    content: {
      hero: {
        title: `Welcome to ${topic}`,
        subtitle: `Your monthly dose of Ghanaian cuisine inspiration`,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop'
      },
      sections,
      footer: {
        message: "Thank you for being part of the Queen's Meal family!",
        socialLinks: [
          {
            platform: "Instagram",
            url: "https://instagram.com/queens_meal"
          },
          {
            platform: "TikTok",
            url: "https://tiktok.com/@queens_meal"
          }
        ]
      }
    },
    tags: [topic.toLowerCase(), theme, tone]
  };
}