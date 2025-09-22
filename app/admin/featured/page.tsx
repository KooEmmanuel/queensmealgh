'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Plus, 
  Trash, 
  Upload, 
  Image as ImageIcon, 
  Edit, 
  Save, 
  Eye,
  Calendar,
  ChefHat,
  List,
  FileText,
  X,
  Check,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EnhancedAIContentGenerator } from "@/components/EnhancedAIContentGenerator";

interface FeaturedContent {
  _id: string;
  title: string;
  description: string;
  imageBase64: string;
  ingredients?: string[];
  instructions?: string[];
  createdAt: string;
}

export default function FeaturedContentPage() {
  const [featuredItems, setFeaturedItems] = useState<FeaturedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/featured/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured content');
      }
      
      const data = await response.json();
      setFeaturedItems(data);
    } catch (error) {
      console.error('Error fetching featured content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch featured content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (1MB max)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 1MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    const fileReader = new FileReader();
    
    fileReader.onload = (event) => {
      const result = event.target?.result as string;
      setImageBase64(result);
      setPreviewUrl(result);
    };
    
    fileReader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the image file",
        variant: "destructive"
      });
    };
    
    // Start reading the file
    fileReader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: "Missing title",
        description: "Please enter a title for the featured content",
        variant: "destructive"
      });
      return;
    }
    
    if (!imageBase64 || imageBase64.length === 0) {
      toast({
        title: "Missing image",
        description: "Please upload an image for the featured content",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const filteredIngredients = ingredients.filter(item => item.trim() !== '');
      const filteredInstructions = instructions.filter(item => item.trim() !== '');
      
      // Different endpoint for edit vs create
      const url = isEditMode ? `/api/featured/${editingId}` : '/api/featured';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          imageBase64,
          ingredients: filteredIngredients,
          instructions: filteredInstructions
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      toast({
        title: "Success",
        description: isEditMode ? "Featured content updated successfully" : "Featured content created successfully",
      });
      
      // Reset form and edit mode
      setTitle('');
      setDescription('');
      setImageBase64('');
      setPreviewUrl('');
      setIngredients(['']);
      setInstructions(['']);
      setIsEditMode(false);
      setEditingId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the list
      fetchFeaturedContent();
    } catch (error) {
      console.error('Error creating featured content:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create featured content",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this featured content?')) {
      return;
    }

    try {
      const response = await fetch(`/api/featured/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete featured content');
      }

      toast({
        title: "Success",
        description: "Featured content deleted successfully",
      });

      // Refresh the list
      fetchFeaturedContent();
    } catch (error) {
      console.error('Error deleting featured content:', error);
      toast({
        title: "Error",
        description: "Failed to delete featured content",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: FeaturedContent) => {
    setTitle(item.title);
    setDescription(item.description);
    setImageBase64(item.imageBase64);
    setPreviewUrl(item.imageBase64);
    setIngredients(item.ingredients && item.ingredients.length > 0 ? item.ingredients : ['']);
    setInstructions(item.instructions && item.instructions.length > 0 ? item.instructions : ['']);
    setEditingId(item._id);
    setIsEditMode(true);
    setActiveTab('create');
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mb-2 sm:mb-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div className="ml-0 sm:ml-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Content</h1>
                <p className="text-xs sm:text-sm text-gray-500">Manage your featured recipes and content</p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 mt-2 sm:mt-0">
              <ChefHat className="h-3 w-3" />
              {featuredItems.length} Items
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'create'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                Create New
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'manage'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                Manage Existing
              </button>
            </nav>
          </div>
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  {isEditMode ? 'Edit Featured Content' : 'Create New Featured Content'}
                </CardTitle>
                <CardDescription>
                  {isEditMode ? 'Update your featured content details' : 'Add a new recipe or content to feature on your site'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Basic Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Grandma's Famous Jollof Rice"
                        required
                        className="w-full text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe this featured content..."
                        rows={3}
                        className="w-full text-sm"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* AI Content Generator */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Content Generator
                    </h3>
                    <EnhancedAIContentGenerator
                      type="featured"
                      onContentGenerated={(content) => {
                        setTitle(content.title);
                        setDescription(content.description);
                        if (content.ingredients) {
                          setIngredients(content.ingredients);
                        }
                        if (content.instructions) {
                          setInstructions(content.instructions);
                        }
                      }}
                      onImageGenerated={(imageUrl) => {
                        setImageBase64(imageUrl);
                        setPreviewUrl(imageUrl);
                      }}
                    />
                  </div>

                  <Separator />

                  {/* Image Upload */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Featured Image
                    </h3>
                    
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 w-full sm:w-auto h-10"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Choose Image</span>
                        </Button>
                        
                        {previewUrl && (
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                            <Image
                              src={previewUrl}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Max file size: 1MB. Recommended: 600x400px for best results.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Ingredients */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Ingredients
                    </h3>
                    
                    <div className="space-y-3">
                      {ingredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              value={ingredient}
                              onChange={(e) => {
                                const newIngredients = [...ingredients];
                                newIngredients[index] = e.target.value;
                                setIngredients(newIngredients);
                              }}
                              placeholder={`Ingredient ${index + 1}`}
                              className="text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newIngredients = [...ingredients];
                              newIngredients.splice(index, 1);
                              setIngredients(newIngredients);
                            }}
                            className="text-red-500 hover:text-red-700 h-10 w-10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIngredients([...ingredients, ''])}
                        className="w-full h-10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="text-sm">Add Ingredient</span>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Instructions */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Instructions
                    </h3>
                    
                    <div className="space-y-3">
                      {instructions.map((instruction, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Step {index + 1}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newInstructions = [...instructions];
                                newInstructions.splice(index, 1);
                                setInstructions(newInstructions);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <Textarea
                            value={instruction}
                            onChange={(e) => {
                              const newInstructions = [...instructions];
                              newInstructions[index] = e.target.value;
                              setInstructions(newInstructions);
                            }}
                            placeholder={`Describe step ${index + 1}...`}
                            rows={2}
                            className="w-full text-sm"
                          />
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInstructions([...instructions, ''])}
                        className="w-full h-10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="text-sm">Add Step</span>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="submit" 
                      className="bg-orange-500 hover:bg-orange-600 text-white flex-1 h-10 sm:h-11"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm sm:text-base">Processing...</span>
                        </>
                      ) : (
                        <>
                          {isEditMode ? (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              <span className="text-sm sm:text-base">Update Content</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              <span className="text-sm sm:text-base">Create Content</span>
                            </>
                          )}
                        </>
                      )}
                    </Button>
                    
                    {isEditMode && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setTitle('');
                          setDescription('');
                          setImageBase64('');
                          setPreviewUrl('');
                          setIngredients(['']);
                          setInstructions(['']);
                          setIsEditMode(false);
                          setEditingId(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="h-10 sm:h-11"
                      >
                        <span className="text-sm sm:text-base">Cancel</span>
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription className="text-sm">
                  See how your featured content will appear
                </CardDescription>
              </CardHeader>
              <CardContent>
                {title && imageBase64 ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative h-40 sm:h-48 w-full rounded-lg overflow-hidden">
                      <Image
                        src={previewUrl || imageBase64}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
                      {description && (
                        <p className="text-sm sm:text-base text-gray-600">{description}</p>
                      )}
                    </div>
                    
                    {ingredients.filter(i => i.trim()).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Ingredients</h4>
                        <ul className="space-y-1">
                          {ingredients.filter(i => i.trim()).map((ingredient, index) => (
                            <li key={index} className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {instructions.filter(i => i.trim()).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Instructions</h4>
                        <ol className="space-y-2">
                          {instructions.filter(i => i.trim()).map((instruction, index) => (
                            <li key={index} className="text-xs sm:text-sm text-gray-600">
                              <span className="font-medium text-orange-500">{index + 1}.</span> {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Add a title and image to see preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <List className="h-5 w-5" />
                Featured Content Library
              </CardTitle>
              <CardDescription className="text-sm">
                Manage your existing featured content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500 text-sm">Loading content...</p>
                </div>
              ) : featuredItems.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No featured content yet</h3>
                  <p className="text-gray-500 mb-4 text-sm">Get started by creating your first featured content</p>
                  <Button onClick={() => setActiveTab('create')} className="h-10">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="text-sm">Create First Content</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {featuredItems.map((item) => (
                    <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-40 sm:h-48">
                        <Image
                          src={item.imageBase64}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(item)}
                            className="flex-1 h-8 sm:h-9"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            <span className="text-xs sm:text-sm">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-700 h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}