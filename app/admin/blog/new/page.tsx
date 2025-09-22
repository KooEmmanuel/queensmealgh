'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Save,
  ChevronDown,
  X,
  ImageIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dynamic from 'next/dynamic';

// Add this interface at the top of the file, after imports
interface EditorBlock {
  id?: string;
  type: string;
  data: {
    text?: string;
    [key: string]: any;
  };
}

// Dynamically import the Editor component
const Editor = dynamic(() => import('@/components/ui/editor-js').then((mod) => mod.Editor), {
  ssr: false, // Disable server-side rendering for this component
  loading: () => <p>Loading editor...</p> // Optional loading state
});

export default function NewBlogPostPage() {
  const [title, setTitle] = useState('');
  const [editorData, setEditorData] = useState<{ blocks: EditorBlock[] }>({ blocks: [] });
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [author, setAuthor] = useState({
    name: 'Admin',
    avatar: ''
  });
  const [category, setCategory] = useState('Uncategorized');
  const { toast } = useToast();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the title input when the page loads
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title to your post",
        variant: "destructive"
      });
      return;
    }

    if (!editorData.blocks || editorData.blocks.length === 0) {
      toast({
        title: "Content required",
        description: "Please add some content to your post",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Extract a brief excerpt from the first paragraph block
      const paragraphBlock = editorData.blocks.find(block => block.type === 'paragraph');
      const excerpt = paragraphBlock ? paragraphBlock.data.text?.substring(0, 150) || '' : '';
      
      // Ensure the content is properly formatted
      const postData = {
        title,
        excerpt,
        content: editorData, // This should be the complete Editor.js data object
        coverImage,
        category,
        author,
        publishNow: true,
        createdAt: new Date().toISOString()
      };
      
      console.log("Sending post data:", postData); // Debug log
      
      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create blog post');
      }
      
      toast({
        title: "Success!",
        description: "Your blog post has been created",
      });
      
      // Redirect to the blog management page
      window.location.href = '/admin/blog';
      
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create blog post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation bar */}
      <div className="sticky top-0 z-10 border-b bg-white px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <Link href="/admin/blog" className="mr-2 sm:mr-4 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div className="flex items-center min-w-0">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mr-2 flex-shrink-0">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="text-xs sm:text-sm">{author.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm font-medium truncate">{author.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-2 sm:h-9 sm:px-3">
                  <span className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{category}</span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCategory('Recipes')}>
                  Recipes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory('Cooking Tips')}>
                  Cooking Tips
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory('Food Stories')}>
                  Food Stories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory('Nutrition')}>
                  Nutrition
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory('Uncategorized')}>
                  Uncategorized
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 sm:h-9 sm:px-4"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 border-2 border-white border-t-transparent rounded-full" />
                  <span className="text-xs sm:text-sm">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Publish</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6 lg:px-8 lg:py-8">
        {/* Cover image section */}
        {coverImage ? (
          <div className="relative mb-6 sm:mb-8 rounded-lg overflow-hidden">
            <div className="aspect-[2/1] w-full">
              <Image 
                src={coverImage} 
                alt="Cover" 
                fill 
                className="object-cover"
              />
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-2 right-2 sm:top-4 sm:right-4 h-8 w-8 sm:h-9 sm:w-9"
              onClick={removeCoverImage}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        ) : (
          <div className="mb-6 sm:mb-8 rounded-lg border-2 border-dashed border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
            <ImageIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
            <div className="mt-3 sm:mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor="cover-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-600 focus-within:ring-offset-2 hover:text-green-500"
              >
                <span className="text-sm sm:text-base">Upload a cover image</span>
                <input
                  id="cover-upload"
                  name="cover-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleCoverImageUpload}
                />
              </label>
            </div>
            <p className="text-xs leading-5 text-gray-600 mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
        
        {/* Title input */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full border-none text-2xl sm:text-3xl lg:text-4xl font-bold focus:outline-none focus:ring-0 mb-6 sm:mb-8"
        />
        
        {/* Editor.js */}
        <div className="min-h-[400px]">
          <Editor 
            data={editorData}
            onChange={setEditorData}
            placeholder="Start writing your blog post..."
          />
        </div>
      </div>
    </div>
  );
} 