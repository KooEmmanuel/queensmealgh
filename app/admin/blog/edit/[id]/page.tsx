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

// Define EditorBlock interface (if not already defined globally)
interface EditorBlock {
  id?: string;
  type: string;
  data: {
    text?: string;
    [key: string]: any;
  };
}

// Define EditorData interface
interface EditorData {
  time?: number;
  blocks: EditorBlock[];
  version?: string;
}


// Dynamically import the Editor component
const Editor = dynamic(() => import('@/components/ui/editor-js').then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const [title, setTitle] = useState('');
  const [editorData, setEditorData] = useState<EditorData>({ blocks: [] }); // Use EditorData type
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [category, setCategory] = useState('Uncategorized');
  const [author, setAuthor] = useState({ name: 'Admin', avatar: '' });
  const [publishStatus, setPublishStatus] = useState(true); // Track publish status

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const titleRef = useRef<HTMLInputElement>(null);
  const [blogId, setBlogId] = useState<string | null>(null);

  // Resolve params
  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setBlogId(resolvedParams.id);
    };
    
    initializeParams();
  }, [params]);

  // Fetch existing post data
  useEffect(() => {
    if (!blogId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blog/${blogId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }
        const post = await response.json();

        setTitle(post.title || '');

        // --- *** PARSE THE CONTENT STRING *** ---
        let parsedContent: EditorData = { blocks: [] }; // Default empty state
        if (post.content && typeof post.content === 'string') {
          try {
            // Attempt to parse the JSON string
            const parsed = JSON.parse(post.content);
            // Basic validation: check if it has a 'blocks' array
            if (parsed && Array.isArray(parsed.blocks)) {
              parsedContent = parsed;
            } else {
              console.warn("Fetched content string doesn't contain a 'blocks' array after parsing:", parsed);
            }
          } catch (parseError) {
            console.error("Failed to parse content JSON string:", parseError);
            // Keep the default empty state or handle the error appropriately
            toast({
              title: "Warning",
              description: "Could not load post content, it might be corrupted.",
              variant: "destructive" // Or 'warning'
            });
          }
        } else if (post.content && typeof post.content === 'object' && Array.isArray(post.content.blocks)) {
           // Handle case where it might already be an object (less likely based on your example)
           parsedContent = post.content;
        }
        setEditorData(parsedContent);
        // --- *** END PARSING LOGIC *** ---

        setCoverImage(post.coverImage || null);
        setCategory(post.category || 'Uncategorized');
        setAuthor(post.author || { name: 'Admin', avatar: '' });
        setPublishStatus(post.status === 'published');

      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive"
        });
        // Optionally redirect or show an error state
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [blogId, toast]);


  // Handler for saving changes
  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    // Add check for editor data if needed
    // if (!editorData || editorData.blocks.length === 0) {
    //   toast({ title: "Content required", variant: "destructive" });
    //   return;
    // }

    try {
      setIsSubmitting(true);

      // Extract excerpt (optional, can be done on server too)
      const paragraphBlock = editorData.blocks.find(block => block.type === 'paragraph');
      const excerpt = paragraphBlock?.data.text?.substring(0, 150) || '';

      const postData = {
        title,
        excerpt,
        content: editorData, // Send the editor data object
        imageUrl: coverImage, // Use coverImage state
        category,
        author,
        publishNow: publishStatus,
        updatedAt: new Date().toISOString() // Add updatedAt timestamp
      };

      const response = await fetch(`/api/blog/${blogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update blog post');
      }

      toast({ title: "Success!", description: "Blog post updated" });
      window.location.href = '/admin/blog'; // Redirect after save

    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for cover image
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

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation bar */}
      <div className="sticky top-0 z-10 border-b bg-white px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Back button, Author */}
          <div className="flex items-center">
            <Link href="/admin/blog" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{author.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{author.name}</span>
            </div>
          </div>

          {/* Right side: Category Dropdown, Save Button */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  {category}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 {/* Add category options */}
                 <DropdownMenuItem onClick={() => setCategory('Recipes')}>Recipes</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setCategory('Cooking Tips')}>Cooking Tips</DropdownMenuItem>
                 {/* ... other categories */}
                 <DropdownMenuItem onClick={() => setCategory('Uncategorized')}>Uncategorized</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Cover image section */}
        {coverImage ? (
          <div className="relative mb-8 rounded-lg overflow-hidden aspect-[2/1] w-full">
            <Image src={coverImage} alt="Cover" fill className="object-cover" />
            <Button variant="destructive" size="sm" className="absolute top-4 right-4" onClick={removeCoverImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mb-8 rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <label htmlFor="cover-upload" className="mt-4 relative cursor-pointer rounded-md bg-white font-semibold text-green-600 hover:text-green-500">
              <span>Upload a cover image</span>
              <input id="cover-upload" type="file" accept="image/*" className="sr-only" onChange={handleCoverImageUpload} />
            </label>
            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}

        {/* Title input */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
          className="w-full border-none text-4xl font-bold focus:outline-none focus:ring-0 mb-8"
        />

        {/* Editor.js Instance */}
        <div className="editor-wrapper prose max-w-none min-h-[300px]"> {/* Added wrapper and prose */}
           <Editor
             // Use editorData state which holds the fetched content
             data={editorData}
             // Update editorData state when content changes
             onChange={setEditorData}
             placeholder="Start writing your blog post..."
           />
        </div>
      </div>
    </div>
  );
} 