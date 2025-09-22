"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Sparkles, 
  Wand2, 
  Loader2, 
  Copy, 
  Check,
  RefreshCw,
  Edit3,
  Save,
  Eye,
  Send,
  Calendar,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';

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

export function NewsletterGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<NewsletterContent | null>(null);
  const [editingContent, setEditingContent] = useState<NewsletterContent | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    topic: '',
    theme: 'monthly',
    tone: 'friendly',
    targetAudience: 'food enthusiasts',
    length: 'medium',
    // Advanced options
    specificContent: '',
    featuredRecipes: '',
    seasonalFocus: '',
    culturalTheme: '',
    specialEvents: '',
    callToAction: '',
    socialMediaFocus: ''
  });

  const handleGenerateNewsletter = async () => {
    if (!formData.topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for the newsletter",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate newsletter');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setEditingContent({ ...data.content });
      setIsReviewMode(true);
      
      toast({
        title: "Newsletter Generated!",
        description: "Review and edit the content before saving or sending",
      });
    } catch (error) {
      console.error('Error generating newsletter:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate newsletter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNewsletter = async () => {
    if (!editingContent) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/newsletter/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingContent,
          status: 'draft',
          createdAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save newsletter');
      }

      toast({
        title: "Newsletter Saved!",
        description: "Your newsletter has been saved as a draft",
      });
    } catch (error) {
      console.error('Error saving newsletter:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save newsletter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!editingContent) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingContent,
          status: 'sent',
          sentAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send newsletter');
      }

      toast({
        title: "Newsletter Sent!",
        description: "Your newsletter has been sent to all subscribers",
      });
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send newsletter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
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
      theme: 'monthly',
      tone: 'friendly',
      targetAudience: 'food enthusiasts',
      length: 'medium',
      specificContent: '',
      featuredRecipes: '',
      seasonalFocus: '',
      culturalTheme: '',
      specialEvents: '',
      callToAction: '',
      socialMediaFocus: ''
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

  const updateSection = (index: number, field: string, value: string) => {
    if (editingContent) {
      const newSections = [...editingContent.content.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      setEditingContent({
        ...editingContent,
        content: {
          ...editingContent.content,
          sections: newSections
        }
      });
    }
  };

  const addSection = () => {
    if (editingContent) {
      const newSection = {
        type: 'text' as const,
        title: 'New Section',
        content: 'Add your content here...',
        ctaText: '',
        ctaUrl: ''
      };
      setEditingContent({
        ...editingContent,
        content: {
          ...editingContent.content,
          sections: [...editingContent.content.sections, newSection]
        }
      });
    }
  };

  const removeSection = (index: number) => {
    if (editingContent) {
      const newSections = editingContent.content.sections.filter((_, i) => i !== index);
      setEditingContent({
        ...editingContent,
        content: {
          ...editingContent.content,
          sections: newSections
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Newsletter Generator
          </CardTitle>
          <CardDescription>
            Generate engaging newsletters using AI with your brand and content focus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Newsletter Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Summer Recipes, Ghanaian Cuisine, Cooking Tips"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Newsletter Theme</Label>
              <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Newsletter</SelectItem>
                  <SelectItem value="weekly">Weekly Newsletter</SelectItem>
                  <SelectItem value="seasonal">Seasonal Special</SelectItem>
                  <SelectItem value="recipe-focus">Recipe Focus</SelectItem>
                  <SelectItem value="cultural">Cultural Celebration</SelectItem>
                  <SelectItem value="tips">Cooking Tips</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly & Warm</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual & Fun</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="inspiring">Inspiring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select value={formData.length} onValueChange={(value) => setFormData({ ...formData, length: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (2-3 sections)</SelectItem>
                  <SelectItem value="medium">Medium (4-5 sections)</SelectItem>
                  <SelectItem value="long">Long (6+ sections)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <Label htmlFor="specificContent">Specific Content to Include</Label>
                  <Textarea
                    id="specificContent"
                    placeholder="Any specific recipes, tips, or content you want to highlight..."
                    value={formData.specificContent}
                    onChange={(e) => setFormData({ ...formData, specificContent: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuredRecipes">Featured Recipes</Label>
                  <Textarea
                    id="featuredRecipes"
                    placeholder="Specific recipes you want to feature..."
                    value={formData.featuredRecipes}
                    onChange={(e) => setFormData({ ...formData, featuredRecipes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seasonalFocus">Seasonal Focus</Label>
                  <Input
                    id="seasonalFocus"
                    placeholder="e.g., Summer ingredients, holiday recipes..."
                    value={formData.seasonalFocus}
                    onChange={(e) => setFormData({ ...formData, seasonalFocus: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="culturalTheme">Cultural Theme</Label>
                  <Input
                    id="culturalTheme"
                    placeholder="e.g., Ghanaian traditions, West African cuisine..."
                    value={formData.culturalTheme}
                    onChange={(e) => setFormData({ ...formData, culturalTheme: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialEvents">Special Events</Label>
                  <Input
                    id="specialEvents"
                    placeholder="e.g., National holidays, food festivals..."
                    value={formData.specialEvents}
                    onChange={(e) => setFormData({ ...formData, specialEvents: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callToAction">Call to Action</Label>
                  <Input
                    id="callToAction"
                    placeholder="e.g., Follow us on social media, try our recipes..."
                    value={formData.callToAction}
                    onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGenerateNewsletter}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Newsletter...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Newsletter
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
              Review & Edit Newsletter Content
            </CardTitle>
            <CardDescription>
              Review the AI-generated newsletter and make any necessary edits before saving or sending
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subject Line */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Subject Line</Label>
              <div className="flex gap-2">
                <Input
                  value={editingContent.subject}
                  onChange={(e) => updateEditingContent('subject', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(editingContent.subject, 'Subject')}
                >
                  {copiedField === 'Subject' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Preview Text */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview Text</Label>
              <div className="flex gap-2">
                <Textarea
                  value={editingContent.previewText}
                  onChange={(e) => updateEditingContent('previewText', e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(editingContent.previewText, 'Preview')}
                >
                  {copiedField === 'Preview' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Hero Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hero Section</Label>
              <div className="space-y-2">
                <Input
                  value={editingContent.content.hero.title}
                  onChange={(e) => updateEditingContent('content', {
                    ...editingContent.content,
                    hero: { ...editingContent.content.hero, title: e.target.value }
                  })}
                  placeholder="Hero title"
                />
                <Textarea
                  value={editingContent.content.hero.subtitle}
                  onChange={(e) => updateEditingContent('content', {
                    ...editingContent.content,
                    hero: { ...editingContent.content.hero, subtitle: e.target.value }
                  })}
                  placeholder="Hero subtitle"
                  rows={2}
                />
              </div>
            </div>

            {/* Newsletter Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Newsletter Sections</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSection}
                >
                  + Add Section
                </Button>
              </div>
              
              <div className="space-y-4">
                {editingContent.content.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Section {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Section Type</Label>
                        <Select 
                          value={section.type} 
                          onValueChange={(value) => updateSection(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="recipe">Recipe</SelectItem>
                            <SelectItem value="tip">Cooking Tip</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
                            <SelectItem value="cta">Call to Action</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(index, 'title', e.target.value)}
                          placeholder="Section title"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Content</Label>
                      <Textarea
                        value={section.content}
                        onChange={(e) => updateSection(index, 'content', e.target.value)}
                        placeholder="Section content"
                        rows={4}
                      />
                    </div>
                    
                    {section.type === 'cta' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">CTA Text</Label>
                          <Input
                            value={section.ctaText || ''}
                            onChange={(e) => updateSection(index, 'ctaText', e.target.value)}
                            placeholder="Button text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">CTA URL</Label>
                          <Input
                            value={section.ctaUrl || ''}
                            onChange={(e) => updateSection(index, 'ctaUrl', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                onClick={handleSaveNewsletter}
                disabled={isSaving}
                variant="outline"
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleSendNewsletter}
                disabled={isSending}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Newsletter
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}