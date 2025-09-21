'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Trash, Upload, Image as ImageIcon, Edit, Save } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
        description: "Failed to load featured content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log("No file selected");
      return;
    }
    
    const file = files[0];
    console.log("File selected:", file.name, file.type, file.size);
    
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 1MB",
        variant: "destructive"
      });
      return;
    }
    
    // Use a different approach to read the file
    const fileReader = new FileReader();
    
    fileReader.addEventListener("load", function() {
      // This is called once the read operation is complete
      const result = this.result;
      console.log("FileReader result type:", typeof result);
      console.log("FileReader result length:", result ? result.toString().length : 0);
      
      if (result && typeof result === "string") {
        setImageBase64(result);
        setPreviewUrl(result);
      } else {
        console.error("Failed to read file as base64");
      }
    });
    
    // Start reading the file
    fileReader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted", { 
      title, 
      description, 
      imageBase64Length: imageBase64.length,
      imageBase64Preview: imageBase64.substring(0, 50) + "..." 
    });
    
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
      console.log("Sending request to API...");
      
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
      }).catch(err => {
        console.error("Fetch error:", err);
        throw new Error(`Network error: ${err.message}`);
      });
      
      console.log("Response status:", response.status);
      
      const data = await response.json().catch(err => {
        console.error("JSON parse error:", err);
        return { error: "Failed to parse response" };
      });
      
      console.log("API response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      toast({
        title: "Success",
        description: "Featured content created successfully",
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
    try {
      const response = await fetch(`/api/featured?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      
      // Refresh the list
      fetchFeaturedContent();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: FeaturedContent) => {
    setTitle(item.title);
    setDescription(item.description || '');
    setImageBase64(item.imageBase64);
    setPreviewUrl(item.imageBase64);
    setIngredients(item.ingredients?.length ? item.ingredients : ['']);
    setInstructions(item.instructions?.length ? item.instructions : ['']);
    setEditingId(item._id);
    setIsEditMode(true);
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin" className="flex items-center text-gray-600 hover:text-orange-500">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Manage Featured Content</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Featured Content' : 'Add New Featured Content'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="mt-1 flex items-center">
              <label className="block">
                <span className="sr-only">Choose image</span>
                <input 
                  type="file" 
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
              </label>
              {previewUrl && (
                <div className="ml-4 relative h-20 w-20 rounded-md overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max file size: 1MB. Recommended dimensions: 600x400px.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients
            </label>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index] = e.target.value;
                      setIngredients(newIngredients);
                    }}
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newIngredients = [...ingredients];
                      newIngredients.splice(index, 1);
                      setIngredients(newIngredients);
                    }}
                  >
                    -
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIngredients([...ingredients, ''])}
              >
                Add Ingredient
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={instruction}
                    onChange={(e) => {
                      const newInstructions = [...instructions];
                      newInstructions[index] = e.target.value;
                      setInstructions(newInstructions);
                    }}
                    placeholder={`Step ${index + 1}`}
                    rows={2}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newInstructions = [...instructions];
                      newInstructions.splice(index, 1);
                      setInstructions(newInstructions);
                    }}
                  >
                    -
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setInstructions([...instructions, ''])}
              >
                Add Step
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                {isEditMode ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Featured Content
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Featured Content
                  </>
                )}
              </>
            )}
          </Button>
          {isEditMode && (
            <Button 
              type="button" 
              variant="outline"
              className="ml-2"
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
            >
              Cancel Edit
            </Button>
          )}
        </form>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Featured Content History</h2>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : featuredItems.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No featured content yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {featuredItems.map((item) => (
            <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="w-16 h-16 mr-4 relative">
                <Image
                  src={item.imageBase64}
                  alt={item.title}
                  fill
                  className="rounded object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-500 hover:text-blue-700 mr-2"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(item._id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 