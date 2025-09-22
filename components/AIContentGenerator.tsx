'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Sparkles, 
  Wand2, 
  Image as ImageIcon, 
  Loader2, 
  Copy, 
  Check,
  RefreshCw
} from 'lucide-react';

interface AIContentGeneratorProps {
  type: 'featured' | 'blog';
  onContentGenerated: (content: any) => void;
  onImageGenerated?: (imageUrl: string) => void;
  className?: string;
}

interface GeneratedContent {
  title: string;
  description: string;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
  excerpt?: string;
  content?: any;
}

export function AIContentGenerator({ 
  type, 
  onContentGenerated, 
  onImageGenerated,
  className = '' 
}: AIContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    topic: '',
    cuisine: 'Ghanaian',
    difficulty: 'medium',
    category: 'Recipes',
    targetAudience: 'food enthusiasts',
    tone: 'friendly',
    length: 'medium',
    style: 'photographic',
    aspectRatio: 'landscape'
  });

  const handleGenerateContent = async () => {
    if (!formData.topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for content generation",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          ...formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      onContentGenerated(data.content);
      
      toast({
        title: "Content Generated!",
        description: "AI has created your content successfully",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedContent?.title) {
      toast({
        title: "Content Required",
        description: "Please generate content first before creating an image",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generatedContent.title,
          type,
          cuisine: formData.cuisine,
          style: formData.style,
          aspectRatio: formData.aspectRatio
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      onImageGenerated?.(data.imageUrl);
      
      toast({
        title: "Image Generated!",
        description: "AI has created your image successfully",
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Image Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      topic: '',
      cuisine: 'Ghanaian',
      difficulty: 'medium',
      category: 'Recipes',
      targetAudience: 'food enthusiasts',
      tone: 'friendly',
      length: 'medium',
      style: 'photographic',
      aspectRatio: 'landscape'
    });
    setGeneratedContent(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Generate {type} content using AI. Fill in the details below and let AI create amazing content for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder={type === 'featured' ? 'e.g., Jollof Rice' : 'e.g., Traditional Cooking Methods'}
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            {type === 'featured' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine</Label>
                  <Select value={formData.cuisine} onValueChange={(value) => setFormData({ ...formData, cuisine: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ghanaian">Ghanaian</SelectItem>
                      <SelectItem value="Nigerian">Nigerian</SelectItem>
                      <SelectItem value="West African">West African</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recipes">Recipes</SelectItem>
                    <SelectItem value="Cooking Tips">Cooking Tips</SelectItem>
                    <SelectItem value="Food Stories">Food Stories</SelectItem>
                    <SelectItem value="Nutrition">Nutrition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'blog' && (
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Select value={formData.length} onValueChange={(value) => setFormData({ ...formData, length: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={resetForm}
              className="sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generated Content
            </CardTitle>
            <CardDescription>
              Review and use the AI-generated content below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Title</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent.title, 'Title')}
                >
                  {copiedField === 'Title' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{generatedContent.title}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Description</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent.description, 'Description')}
                >
                  {copiedField === 'Description' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm">{generatedContent.description}</p>
              </div>
            </div>

            {/* Ingredients (for featured content) */}
            {type === 'featured' && generatedContent.ingredients && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Ingredients</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.ingredients?.join('\n') || '', 'Ingredients')}
                  >
                    {copiedField === 'Ingredients' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <ul className="space-y-1">
                    {generatedContent.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm">• {ingredient}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Instructions (for featured content) */}
            {type === 'featured' && generatedContent.instructions && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Instructions</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.instructions?.join('\n') || '', 'Instructions')}
                  >
                    {copiedField === 'Instructions' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <ol className="space-y-2">
                    {generatedContent.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{index + 1}.</span> {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Tags */}
            {generatedContent.tags && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Tags</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.tags?.join(', ') || '', 'Tags')}
                  >
                    {copiedField === 'Tags' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Image Generation */}
            {onImageGenerated && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate Cover Image
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}