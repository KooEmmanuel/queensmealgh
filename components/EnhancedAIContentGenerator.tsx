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
  RefreshCw,
  Edit3,
  Save,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp
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

export function EnhancedAIContentGenerator({ 
  type, 
  onContentGenerated, 
  onImageGenerated,
  className = '' 
}: AIContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [editingContent, setEditingContent] = useState<GeneratedContent | null>(null);
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
    aspectRatio: 'landscape',
    // Advanced options
    additionalContext: '',
    specificInstructions: '',
    culturalNotes: '',
    dietaryRestrictions: '',
    cookingTime: '',
    servingSize: '',
    skillLevel: 'intermediate',
    flavorProfile: 'balanced',
    cookingMethod: 'traditional'
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
      setEditingContent({ ...data.content });
      setIsReviewMode(true);
      
      toast({
        title: "Content Generated!",
        description: "Review and edit the content before applying",
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

  const handleApplyContent = () => {
    if (editingContent) {
      onContentGenerated(editingContent);
      setIsReviewMode(false);
      toast({
        title: "Content Applied!",
        description: "AI-generated content has been applied to your form",
      });
    }
  };

  const handleRegenerateContent = () => {
    setIsReviewMode(false);
    setGeneratedContent(null);
    setEditingContent(null);
    handleGenerateContent();
  };

  const handleGenerateImage = async () => {
    if (!editingContent?.title) {
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
          prompt: editingContent.title,
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
      aspectRatio: 'landscape',
      additionalContext: '',
      specificInstructions: '',
      culturalNotes: '',
      dietaryRestrictions: '',
      cookingTime: '',
      servingSize: '',
      skillLevel: 'intermediate',
      flavorProfile: 'balanced',
      cookingMethod: 'traditional'
    });
    setGeneratedContent(null);
    setEditingContent(null);
    setIsReviewMode(false);
  };

  const updateEditingContent = (field: string, value: any) => {
    if (editingContent) {
      setEditingContent({
        ...editingContent,
        [field]: value
      });
    }
  };

  const updateIngredient = (index: number, value: string) => {
    if (editingContent?.ingredients) {
      const newIngredients = [...editingContent.ingredients];
      newIngredients[index] = value;
      updateEditingContent('ingredients', newIngredients);
    }
  };

  const addIngredient = () => {
    if (editingContent?.ingredients) {
      updateEditingContent('ingredients', [...editingContent.ingredients, '']);
    }
  };

  const removeIngredient = (index: number) => {
    if (editingContent?.ingredients) {
      const newIngredients = editingContent.ingredients.filter((_, i) => i !== index);
      updateEditingContent('ingredients', newIngredients);
    }
  };

  const updateInstruction = (index: number, value: string) => {
    if (editingContent?.instructions) {
      const newInstructions = [...editingContent.instructions];
      newInstructions[index] = value;
      updateEditingContent('instructions', newInstructions);
    }
  };

  const addInstruction = () => {
    if (editingContent?.instructions) {
      updateEditingContent('instructions', [...editingContent.instructions, '']);
    }
  };

  const removeInstruction = (index: number) => {
    if (editingContent?.instructions) {
      const newInstructions = editingContent.instructions.filter((_, i) => i !== index);
      updateEditingContent('instructions', newInstructions);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Enhanced AI Content Generator
          </CardTitle>
          <CardDescription>
            Generate {type} content using AI with detailed context and review capabilities.
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

          {/* Advanced Options Toggle */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Advanced Options
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="additionalContext">Additional Context</Label>
                  <Textarea
                    id="additionalContext"
                    placeholder="Any specific details, variations, or special requirements..."
                    value={formData.additionalContext}
                    onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specificInstructions">Specific Instructions</Label>
                  <Textarea
                    id="specificInstructions"
                    placeholder="Special instructions for the AI (e.g., focus on health benefits, include cultural history)..."
                    value={formData.specificInstructions}
                    onChange={(e) => setFormData({ ...formData, specificInstructions: e.target.value })}
                    rows={3}
                  />
                </div>

                {type === 'featured' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="culturalNotes">Cultural Notes</Label>
                      <Input
                        id="culturalNotes"
                        placeholder="e.g., Traditional festival dish, family recipe..."
                        value={formData.culturalNotes}
                        onChange={(e) => setFormData({ ...formData, culturalNotes: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                      <Input
                        id="dietaryRestrictions"
                        placeholder="e.g., Vegetarian, Gluten-free, Halal..."
                        value={formData.dietaryRestrictions}
                        onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cookingTime">Cooking Time</Label>
                      <Input
                        id="cookingTime"
                        placeholder="e.g., 30 minutes, 2 hours..."
                        value={formData.cookingTime}
                        onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servingSize">Serving Size</Label>
                      <Input
                        id="servingSize"
                        placeholder="e.g., 4-6 people, 8 servings..."
                        value={formData.servingSize}
                        onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skillLevel">Skill Level</Label>
                      <Select value={formData.skillLevel} onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flavorProfile">Flavor Profile</Label>
                      <Select value={formData.flavorProfile} onValueChange={(value) => setFormData({ ...formData, flavorProfile: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="spicy">Spicy</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cookingMethod">Cooking Method</Label>
                      <Select value={formData.cookingMethod} onValueChange={(value) => setFormData({ ...formData, cookingMethod: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="traditional">Traditional</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="fusion">Fusion</SelectItem>
                          <SelectItem value="healthy">Healthy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

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

      {/* Review and Edit Mode */}
      {isReviewMode && editingContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Review & Edit Generated Content
            </CardTitle>
            <CardDescription>
              Review the AI-generated content and make any necessary edits before applying
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title</Label>
              <div className="flex gap-2">
                <Input
                  value={editingContent.title}
                  onChange={(e) => updateEditingContent('title', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(editingContent.title, 'Title')}
                >
                  {copiedField === 'Title' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <div className="flex gap-2">
                <Textarea
                  value={editingContent.description}
                  onChange={(e) => updateEditingContent('description', e.target.value)}
                  rows={3}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(editingContent.description, 'Description')}
                >
                  {copiedField === 'Description' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Ingredients (for featured content) */}
            {type === 'featured' && editingContent.ingredients && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Ingredients</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(editingContent.ingredients?.join('\n') || '', 'Ingredients')}
                  >
                    {copiedField === 'Ingredients' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingContent.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        placeholder={`Ingredient ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addIngredient}
                    className="w-full"
                  >
                    + Add Ingredient
                  </Button>
                </div>
              </div>
            )}

            {/* Instructions (for featured content) */}
            {type === 'featured' && editingContent.instructions && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Instructions</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(editingContent.instructions?.join('\n') || '', 'Instructions')}
                  >
                    {copiedField === 'Instructions' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingContent.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            Step {index + 1}
                          </Badge>
                        </div>
                        <Textarea
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder={`Describe step ${index + 1}...`}
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addInstruction}
                    className="w-full"
                  >
                    + Add Step
                  </Button>
                </div>
              </div>
            )}

            {/* Tags */}
            {editingContent.tags && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Tags</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(editingContent.tags?.join(', ') || '', 'Tags')}
                  >
                    {copiedField === 'Tags' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingContent.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                onClick={handleApplyContent}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Apply Content
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleRegenerateContent}
                disabled={isGenerating}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              
              {onImageGenerated && (
                <Button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  variant="outline"
                  className="flex-1"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}