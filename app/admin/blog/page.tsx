'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Upload,
  X,
  Sparkles,
  ImageIcon
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { BlogPost } from "@/types/blog-post";

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    category: '',
    author: {
      name: 'Admin',
      avatar: ''
    }
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog/all');
      // Type data as 'any' initially to check its structure
      const data: any = await response.json(); 
      
      // Check if the response is an object with a 'posts' property which is an array
      if (data && typeof data === 'object' && Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else if (Array.isArray(data)) {
        // Handle the case where the API returns the array directly
        setPosts(data);
      } else {
        setPosts([]); // Default to empty array if format is unknown
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = isEditing && selectedPost 
        ? `/api/blog/${selectedPost._id}` 
        : '/api/blog/create';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save blog post');
      }
      
      toast({
        title: isEditing ? "Post Updated" : "Post Created",
        description: isEditing 
          ? "Your blog post has been updated successfully" 
          : "Your blog post has been created successfully",
      });
      
      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }
      
      toast({
        title: "Post Deleted",
        description: "The blog post has been deleted successfully",
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      imageUrl: post.coverImage || '',
      category: post.category || '',
      author: {
        name: post.author.name,
        avatar: post.author.avatar || ''
      }
    });
    setImagePreview(post.coverImage || '');
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      category: '',
      author: {
        name: 'Admin',
        avatar: ''
      }
    });
    setImagePreview(null);
    setIsEditing(false);
    setSelectedPost(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredPosts: BlogPost[] = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          topic: formData.category,
          tone: 'informative and friendly'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content');
      }
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        excerpt: data.excerpt,
        content: data.content
      }));
      
      // If image generation is enabled
      if (data.imagePrompt) {
        await generateImage(data.imagePrompt);
      }
      
      toast({
        title: "Content Generated",
        description: "AI-generated content has been added to your post",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (prompt: string) => {
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      setImagePreview(data.imageUrl);
      setFormData(prev => ({
        ...prev,
        imageUrl: data.imageUrl
      }));
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Blog Management</h1>
        </div>
        <Link href="/admin/blog/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Post
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All Blog Posts</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              type="text"
              placeholder="Search posts..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading blog posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No posts match your search' : 'No blog posts found'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post: BlogPost) => (
                  <TableRow key={post._id}>
                    <TableCell>
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          width={60}
                          height={40}
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-[60px] h-[40px] bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/blog/edit/${post._id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(post._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update your blog post details below' 
                : 'Fill in the details to create a new blog post'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter post title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="E.g., Recipes, Tips, News"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Excerpt</label>
                  <Textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Brief summary of the post"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Author Name</label>
                  <Input
                    name="authorName"
                    value={formData.author.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      author: { ...prev.author, name: e.target.value } 
                    }))}
                    placeholder="Author name"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Featured Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={300}
                          height={200}
                          className="mx-auto object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, imageUrl: '' }));
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Drag & drop an image or click to browse
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateContent}
                    disabled={isGenerating || !formData.title}
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Content
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => generateImage(formData.title)}
                    disabled={isGenerating || !formData.title}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Generate Image
                  </Button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <div className="border rounded-md">
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                      controls={[
                        ['bold', 'italic', 'underline', 'link'],
                        ['h1', 'h2', 'h3'],
                        ['unorderedList', 'orderedList'],
                        ['alignLeft', 'alignCenter', 'alignRight'],
                        ['image', 'video']
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditing ? 'Update Post' : 'Create Post'}</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 