import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ContentRequest {
  type: 'featured' | 'blog';
  topic?: string;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'educational';
  length?: 'short' | 'medium' | 'long';
  // Enhanced options
  additionalContext?: string;
  specificInstructions?: string;
  culturalNotes?: string;
  dietaryRestrictions?: string;
  cookingTime?: string;
  servingSize?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  flavorProfile?: 'mild' | 'balanced' | 'spicy' | 'bold';
  cookingMethod?: 'traditional' | 'modern' | 'fusion' | 'healthy';
}

interface GeneratedContent {
  title: string;
  description: string;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
  excerpt?: string;
  content?: any; // For blog content structure
}

export async function POST(request: NextRequest) {
  try {
    const body: ContentRequest = await request.json();
    const { 
      type, 
      topic, 
      cuisine = 'Ghanaian', 
      difficulty = 'medium', 
      category = 'Recipes',
      targetAudience = 'food enthusiasts',
      tone = 'friendly',
      length = 'medium'
    } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 }
      );
    }

    let generatedContent: GeneratedContent;

    if (type === 'featured') {
      generatedContent = await generateFeaturedContent({
        topic,
        cuisine,
        difficulty,
        targetAudience,
        tone
      });
    } else if (type === 'blog') {
      generatedContent = await generateBlogContent({
        topic,
        category,
        targetAudience,
        tone,
        length
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid content type. Must be "featured" or "blog"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content: generatedContent
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

async function generateFeaturedContent(params: {
  topic?: string;
  cuisine: string;
  difficulty: string;
  targetAudience: string;
  tone: string;
  additionalContext?: string;
  specificInstructions?: string;
  culturalNotes?: string;
  dietaryRestrictions?: string;
  cookingTime?: string;
  servingSize?: string;
  skillLevel?: string;
  flavorProfile?: string;
  cookingMethod?: string;
}): Promise<GeneratedContent> {
  const { 
    topic, 
    cuisine, 
    difficulty, 
    targetAudience, 
    tone,
    additionalContext,
    specificInstructions,
    culturalNotes,
    dietaryRestrictions,
    cookingTime,
    servingSize,
    skillLevel,
    flavorProfile,
    cookingMethod
  } = params;

  // Generate a recipe topic if not provided
  const recipeTopic = topic || generateRecipeTopic(cuisine);

  try {
    const systemPrompt = `You are an expert African cuisine content creator specializing in ${cuisine} recipes. You create authentic, culturally accurate, and engaging recipe content. Your responses should be in JSON format only.`;

    // Build enhanced prompt with additional context
    let userPrompt = `Create a complete recipe for "${recipeTopic}" in ${cuisine} cuisine style.

Basic Requirements:
- Difficulty: ${difficulty}
- Target Audience: ${targetAudience}
- Tone: ${tone}
- Cuisine: ${cuisine}
- Skill Level: ${skillLevel || 'intermediate'}
- Flavor Profile: ${flavorProfile || 'balanced'}
- Cooking Method: ${cookingMethod || 'traditional'}`;

    // Add optional context
    if (culturalNotes) {
      userPrompt += `\n- Cultural Context: ${culturalNotes}`;
    }
    if (dietaryRestrictions) {
      userPrompt += `\n- Dietary Restrictions: ${dietaryRestrictions}`;
    }
    if (cookingTime) {
      userPrompt += `\n- Cooking Time: ${cookingTime}`;
    }
    if (servingSize) {
      userPrompt += `\n- Serving Size: ${servingSize}`;
    }
    if (additionalContext) {
      userPrompt += `\n- Additional Context: ${additionalContext}`;
    }
    if (specificInstructions) {
      userPrompt += `\n- Specific Instructions: ${specificInstructions}`;
    }

    userPrompt += `

Please provide a JSON response with the following structure:
{
  "title": "Engaging recipe title",
  "description": "Appetizing description (2-3 sentences)",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "tags": ["tag1", "tag2", ...]
}

Make sure the recipe is authentic to ${cuisine} cuisine and appropriate for ${difficulty} difficulty level. Include all the specified context and requirements in your response.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the JSON response
    const generatedContent = JSON.parse(content);
    
    return {
      title: generatedContent.title,
      description: generatedContent.description,
      ingredients: generatedContent.ingredients,
      instructions: generatedContent.instructions,
      tags: generatedContent.tags
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to template-based generation
    return generateFeaturedContentFallback(
      recipeTopic, 
      cuisine, 
      difficulty, 
      tone,
      additionalContext,
      culturalNotes,
      dietaryRestrictions,
      cookingTime,
      servingSize
    );
  }
}

async function generateBlogContent(params: {
  topic?: string;
  category: string;
  targetAudience: string;
  tone: string;
  length: string;
  additionalContext?: string;
  specificInstructions?: string;
}): Promise<GeneratedContent> {
  const { topic, category, targetAudience, tone, length, additionalContext, specificInstructions } = params;

  // Generate a blog topic if not provided
  const blogTopic = topic || generateBlogTopic(category);

  try {
    const systemPrompt = `You are an expert food blogger and content creator specializing in African cuisine and cooking. You create engaging, informative, and culturally authentic blog content. Your responses should be in JSON format only.`;

    // Build enhanced prompt with additional context
    let userPrompt = `Create a complete blog post about "${blogTopic}" in the ${category} category.

Basic Requirements:
- Category: ${category}
- Target Audience: ${targetAudience}
- Tone: ${tone}
- Length: ${length}`;

    // Add optional context
    if (additionalContext) {
      userPrompt += `\n- Additional Context: ${additionalContext}`;
    }
    if (specificInstructions) {
      userPrompt += `\n- Specific Instructions: ${specificInstructions}`;
    }

    userPrompt += `

Please provide a JSON response with the following structure:
{
  "title": "Engaging blog title",
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
      }
    ]
  },
  "tags": ["tag1", "tag2", ...]
}

Create ${length} length content with proper structure including headers and paragraphs. Make it engaging and informative for ${targetAudience}. Include all the specified context and requirements in your response.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the JSON response
    const generatedContent = JSON.parse(content);
    
    return {
      title: generatedContent.title,
      description: generatedContent.excerpt,
      excerpt: generatedContent.excerpt,
      content: generatedContent.content,
      tags: generatedContent.tags
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to template-based generation
    return generateBlogContentFallback(blogTopic, category, tone, length, additionalContext, specificInstructions);
  }
}

// Fallback functions for when OpenAI API fails
async function generateFeaturedContentFallback(
  topic: string, 
  cuisine: string, 
  difficulty: string, 
  tone: string,
  additionalContext?: string,
  culturalNotes?: string,
  dietaryRestrictions?: string,
  cookingTime?: string,
  servingSize?: string
): Promise<GeneratedContent> {
  const title = generateRecipeTitle(topic, cuisine);
  let description = generateRecipeDescription(topic, cuisine, difficulty, tone);
  
  // Enhance description with additional context
  if (culturalNotes) {
    description += ` This dish holds special cultural significance: ${culturalNotes}.`;
  }
  if (dietaryRestrictions) {
    description += ` This recipe is suitable for: ${dietaryRestrictions}.`;
  }
  if (cookingTime) {
    description += ` Cooking time: ${cookingTime}.`;
  }
  if (servingSize) {
    description += ` Serves: ${servingSize}.`;
  }
  if (additionalContext) {
    description += ` ${additionalContext}`;
  }
  
  const ingredients = generateIngredients(topic, cuisine, difficulty);
  const instructions = generateInstructions(topic, cuisine, difficulty);
  const tags = generateTags(topic, cuisine, difficulty);

  return {
    title,
    description,
    ingredients,
    instructions,
    tags
  };
}

async function generateBlogContentFallback(
  topic: string, 
  category: string, 
  tone: string, 
  length: string,
  additionalContext?: string,
  specificInstructions?: string
): Promise<GeneratedContent> {
  const title = generateBlogTitle(topic, category);
  let excerpt = generateBlogExcerpt(topic, category, tone);
  
  // Enhance excerpt with additional context
  if (additionalContext) {
    excerpt += ` ${additionalContext}`;
  }
  if (specificInstructions) {
    excerpt += ` This guide focuses on: ${specificInstructions}.`;
  }
  
  const content = generateBlogContentStructure(topic, category, tone, length);
  const tags = generateBlogTags(topic, category);

  return {
    title,
    description: excerpt,
    excerpt,
    content,
    tags
  };
}

// Helper functions for content generation
function generateRecipeTopic(cuisine: string): string {
  const topics = {
    'Ghanaian': [
      'Jollof Rice', 'Banku and Tilapia', 'Red Red', 'Kelewele', 'Waakye',
      'Fufu and Light Soup', 'Kenkey and Fish', 'Tuo Zaafi', 'Kontomire Stew',
      'Groundnut Soup', 'Palm Nut Soup', 'Okro Soup', 'Garden Egg Stew'
    ],
    'Nigerian': [
      'Nigerian Jollof Rice', 'Pounded Yam and Egusi', 'Pepper Soup', 'Suya',
      'Akara', 'Moi Moi', 'Bitterleaf Soup', 'Ofada Rice', 'Puff Puff'
    ],
    'West African': [
      'Couscous', 'Thieboudienne', 'Mafé', 'Yassa', 'Attiéké', 'Alloco'
    ]
  };

  const cuisineTopics = topics[cuisine as keyof typeof topics] || topics['Ghanaian'];
  return cuisineTopics[Math.floor(Math.random() * cuisineTopics.length)];
}

function generateBlogTopic(category: string): string {
  const topics = {
    'Recipes': [
      'Traditional Cooking Methods', 'Spice Blending Techniques', 'Fermentation in African Cuisine',
      'Street Food Culture', 'Seasonal Cooking', 'Food Preservation Methods'
    ],
    'Cooking Tips': [
      'Knife Skills for Beginners', 'Temperature Control', 'Flavor Balancing',
      'Meal Prep Strategies', 'Kitchen Organization', 'Cooking Time Management'
    ],
    'Food Stories': [
      'Family Recipe Traditions', 'Cultural Food Heritage', 'Local Food Markets',
      'Chef Inspirations', 'Food Memories', 'Culinary Travel Experiences'
    ],
    'Nutrition': [
      'Balanced African Diet', 'Traditional Superfoods', 'Seasonal Nutrition',
      'Plant-Based Options', 'Protein Sources', 'Healthy Cooking Methods'
    ]
  };

  const categoryTopics = topics[category as keyof typeof topics] || topics['Recipes'];
  return categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
}

function generateRecipeTitle(topic: string, cuisine: string): string {
  const adjectives = ['Authentic', 'Traditional', 'Delicious', 'Flavorful', 'Hearty', 'Comforting'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  return `${adjective} ${cuisine} ${topic}`;
}

function generateBlogTitle(topic: string, category: string): string {
  const prefixes = {
    'Recipes': ['How to Make', 'The Art of', 'Mastering', 'Discovering'],
    'Cooking Tips': ['Essential', 'Pro Tips for', 'The Secret to', 'Improving Your'],
    'Food Stories': ['The Story Behind', 'Exploring', 'Celebrating', 'Remembering'],
    'Nutrition': ['The Benefits of', 'Understanding', 'Maximizing', 'The Science of']
  };

  const categoryPrefixes = prefixes[category as keyof typeof prefixes] || prefixes['Recipes'];
  const prefix = categoryPrefixes[Math.floor(Math.random() * categoryPrefixes.length)];
  
  return `${prefix} ${topic}`;
}

function generateRecipeDescription(topic: string, cuisine: string, difficulty: string, tone: string): string {
  const difficultyText = {
    'easy': 'simple and quick to prepare',
    'medium': 'moderately challenging but rewarding',
    'hard': 'complex and time-consuming but worth the effort'
  };

  const toneText = {
    'professional': 'This authentic recipe showcases the rich culinary traditions',
    'casual': 'Here\'s a delicious way to enjoy',
    'friendly': 'Let\'s make this amazing',
    'educational': 'Learn to prepare this traditional'
  };

  return `${toneText[tone as keyof typeof toneText]} ${cuisine} ${topic.toLowerCase()}, ${difficultyText[difficulty as keyof typeof difficultyText]}. Perfect for ${getTimeOfDay()} and great for sharing with family and friends.`;
}

function generateBlogExcerpt(topic: string, category: string, tone: string): string {
  const excerpts = {
    'Recipes': `Discover the secrets behind ${topic.toLowerCase()} and learn how to create this traditional dish in your own kitchen.`,
    'Cooking Tips': `Master the art of ${topic.toLowerCase()} with these essential techniques that will elevate your cooking skills.`,
    'Food Stories': `Explore the rich history and cultural significance of ${topic.toLowerCase()} in African cuisine.`,
    'Nutrition': `Learn about the nutritional benefits and health advantages of ${topic.toLowerCase()} in a balanced diet.`
  };

  return excerpts[category as keyof typeof excerpts] || excerpts['Recipes'];
}

function generateIngredients(topic: string, cuisine: string, difficulty: string): string[] {
  const baseIngredients = {
    'Ghanaian': ['Onions', 'Tomatoes', 'Garlic', 'Ginger', 'Salt', 'Pepper', 'Oil'],
    'Nigerian': ['Onions', 'Tomatoes', 'Garlic', 'Ginger', 'Salt', 'Pepper', 'Palm Oil'],
    'West African': ['Onions', 'Tomatoes', 'Garlic', 'Ginger', 'Salt', 'Pepper', 'Vegetable Oil']
  };

  const cuisineIngredients = baseIngredients[cuisine as keyof typeof baseIngredients] || baseIngredients['Ghanaian'];
  
  const difficultyMultiplier = {
    'easy': 1,
    'medium': 1.5,
    'hard': 2
  };

  const numIngredients = Math.floor(6 * difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier]);
  const selectedIngredients = cuisineIngredients.slice(0, Math.min(numIngredients, cuisineIngredients.length));

  // Add topic-specific ingredients
  if (topic.toLowerCase().includes('rice')) {
    selectedIngredients.push('Rice', 'Tomato Paste');
  }
  if (topic.toLowerCase().includes('soup')) {
    selectedIngredients.push('Stock', 'Herbs');
  }
  if (topic.toLowerCase().includes('fish')) {
    selectedIngredients.push('Fresh Fish', 'Lemon');
  }

  return selectedIngredients;
}

function generateInstructions(topic: string, cuisine: string, difficulty: string): string[] {
  const baseInstructions = [
    'Wash and prepare all ingredients',
    'Heat oil in a large pot or pan',
    'Add onions and cook until translucent',
    'Add garlic and ginger, cook for 1 minute',
    'Add tomatoes and cook until softened',
    'Season with salt and pepper to taste',
    'Add main ingredients and cook until done',
    'Serve hot with your choice of sides'
  ];

  const difficultyMultiplier = {
    'easy': 1,
    'medium': 1.5,
    'hard': 2
  };

  const numSteps = Math.floor(6 * difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier]);
  return baseInstructions.slice(0, Math.min(numSteps, baseInstructions.length));
}

function generateBlogContentStructure(topic: string, category: string, tone: string, length: string): any {
  const lengthMultiplier = {
    'short': 1,
    'medium': 2,
    'long': 3
  };

  const numParagraphs = Math.floor(3 * lengthMultiplier[length as keyof typeof lengthMultiplier]);
  
  const blocks = [
    {
      type: 'header',
      data: {
        text: `Introduction to ${topic}`,
        level: 2
      }
    }
  ];

  for (let i = 0; i < numParagraphs; i++) {
    blocks.push({
      type: 'paragraph',
      data: {
        text: generateParagraph(topic, category, i + 1)
      }
    });
  }

  blocks.push({
    type: 'header',
    data: {
      text: 'Conclusion',
      level: 2
    }
  });

  blocks.push({
    type: 'paragraph',
    data: {
      text: `In conclusion, ${topic.toLowerCase()} plays an important role in African cuisine and culture. We hope this guide has provided valuable insights and inspiration for your culinary journey.`
    }
  });

  return { blocks };
}

function generateParagraph(topic: string, category: string, paragraphNum: number): string {
  const paragraphTemplates = {
    'Recipes': [
      `When it comes to ${topic.toLowerCase()}, the key is in the preparation and technique. Traditional methods have been passed down through generations, ensuring authentic flavors and textures.`,
      `The ingredients used in ${topic.toLowerCase()} are carefully selected to create the perfect balance of flavors. Each component plays a crucial role in the final dish.`,
      `Cooking ${topic.toLowerCase()} requires patience and attention to detail. The process may seem complex at first, but with practice, you'll master the technique.`
    ],
    'Cooking Tips': [
      `Mastering ${topic.toLowerCase()} is essential for any home cook. These techniques will help you improve your skills and create better dishes.`,
      `The secret to successful ${topic.toLowerCase()} lies in understanding the fundamentals. Once you grasp these concepts, your cooking will improve significantly.`,
      `Practice makes perfect when it comes to ${topic.toLowerCase()}. Don't be discouraged if your first attempts aren't perfect - keep trying and learning.`
    ],
    'Food Stories': [
      `The history of ${topic.toLowerCase()} is deeply rooted in African culture and tradition. This dish tells a story of heritage and community.`,
      `Every region has its own unique take on ${topic.toLowerCase()}, reflecting local ingredients and cultural influences.`,
      `The cultural significance of ${topic.toLowerCase()} extends beyond just food - it represents identity, tradition, and community bonds.`
    ],
    'Nutrition': [
      `From a nutritional perspective, ${topic.toLowerCase()} offers numerous health benefits. Understanding these benefits can help you make informed dietary choices.`,
      `The nutritional profile of ${topic.toLowerCase()} makes it an excellent addition to a balanced diet. It provides essential nutrients and energy.`,
      `Incorporating ${topic.toLowerCase()} into your diet can contribute to overall health and well-being. The key is moderation and variety.`
    ]
  };

  const templates = paragraphTemplates[category as keyof typeof paragraphTemplates] || paragraphTemplates['Recipes'];
  return templates[paragraphNum % templates.length];
}

function generateTags(topic: string, cuisine: string, difficulty: string): string[] {
  const baseTags = [cuisine, difficulty, 'authentic', 'traditional'];
  
  if (topic.toLowerCase().includes('rice')) {
    baseTags.push('rice', 'one-pot');
  }
  if (topic.toLowerCase().includes('soup')) {
    baseTags.push('soup', 'comfort-food');
  }
  if (topic.toLowerCase().includes('fish')) {
    baseTags.push('seafood', 'protein');
  }
  
  return baseTags;
}

function generateBlogTags(topic: string, category: string): string[] {
  const baseTags = [category.toLowerCase(), 'african-cuisine', 'cooking'];
  
  if (category === 'Recipes') {
    baseTags.push('traditional', 'authentic');
  } else if (category === 'Cooking Tips') {
    baseTags.push('techniques', 'skills');
  } else if (category === 'Food Stories') {
    baseTags.push('culture', 'heritage');
  } else if (category === 'Nutrition') {
    baseTags.push('health', 'wellness');
  }
  
  return baseTags;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'breakfast';
  if (hour < 17) return 'lunch';
  return 'dinner';
}