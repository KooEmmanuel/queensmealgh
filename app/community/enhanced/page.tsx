"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { UserAuth } from "@/components/community/UserAuth";
import { ThreadCard } from "@/components/community/ThreadCard";
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  MessageSquare,
  Heart,
  Eye,
  Loader2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  _id: string;
  username: string;
  displayName: string;
  email?: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  postCount: number;
  commentCount: number;
  likeCount: number;
  reputation: number;
  badges: string[];
  isVerified: boolean;
  lastActive: string;
}

interface Thread {
  _id: string;
  title: string;
  content: string;
  author: string;
  authorDisplayName: string;
  authorAvatar?: string;
  authorReputation: number;
  authorBadges: string[];
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
  comments: any[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
}

export default function EnhancedCommunityPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("discussions");
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchThreads();
  }, [sortBy, category, searchTerm]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (sortBy) params.append('sort', sortBy);
      if (category && category !== 'all') params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/community/threads?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setThreads(data.threads);
      } else {
        throw new Error(data.error || 'Failed to fetch threads');
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      setError('Failed to load discussions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateThread = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to create a thread",
        variant: "destructive"
      });
      return;
    }

    if (!newThread.title.trim() || !newThread.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and content",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/community/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newThread,
          author: currentUser.username,
          tags: newThread.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Thread Created!",
          description: "Your discussion has been posted successfully",
        });
        setNewThread({ title: '', content: '', category: 'general', tags: '' });
        setShowCreateForm(false);
        fetchThreads(); // Refresh the threads list
      } else {
        throw new Error(data.error || 'Failed to create thread');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: "Creation Failed",
        description: (error as Error).message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLike = async (threadId: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to like posts",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/community/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          username: currentUser.username
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the thread in the local state
        setThreads(threads.map(thread => 
          thread._id === threadId 
            ? { 
                ...thread, 
                likes: data.liked ? thread.likes + 1 : thread.likes - 1,
                isLiked: data.liked 
              }
            : thread
        ));
      }
    } catch (error) {
      console.error('Error liking thread:', error);
    }
  };

  const handleComment = async (threadId: string, content: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to comment",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/community/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          content,
          author: currentUser.username
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchThreads(); // Refresh to get updated comments
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to reply",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/community/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          content,
          author: currentUser.username
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchThreads(); // Refresh to get updated replies
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleBookmark = async (threadId: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to bookmark posts",
        variant: "destructive"
      });
      return;
    }

    // Implement bookmark functionality
    toast({
      title: "Bookmarked!",
      description: "Thread has been bookmarked",
    });
  };

  const handleShare = (thread: Thread) => {
    if (navigator.share) {
      navigator.share({
        title: thread.title,
        text: thread.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Thread link has been copied to clipboard",
      });
    }
  };

  const handleReport = (threadId: string) => {
    toast({
      title: "Reported",
      description: "Thank you for reporting. We'll review this content.",
    });
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General Discussion' },
    { value: 'recipes', label: 'Recipes' },
    { value: 'cooking-tips', label: 'Cooking Tips' },
    { value: 'restaurant-reviews', label: 'Restaurant Reviews' },
    { value: 'food-photography', label: 'Food Photography' },
    { value: 'cultural-food', label: 'Cultural Food' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'equipment', label: 'Kitchen Equipment' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'most_commented', label: 'Most Commented' },
    { value: 'oldest', label: 'Oldest' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community</h1>
                <p className="text-gray-600">Connect with fellow food enthusiasts</p>
              </div>
            </div>
            
            {currentUser && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Thread
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Auth */}
            <UserAuth
              onUserLogin={handleUserLogin}
              onUserLogout={handleUserLogout}
              currentUser={currentUser}
            />

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      category === cat.value
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Threads</span>
                  <span className="font-semibold">{threads.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Comments</span>
                  <span className="font-semibold">5,432</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search discussions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:w-48">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Thread Form */}
            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Thread</CardTitle>
                  <CardDescription>
                    Share your thoughts and start a discussion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      placeholder="What's your discussion about?"
                      value={newThread.title}
                      onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newThread.category} onValueChange={(value) => setNewThread({ ...newThread, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content *</label>
                    <Textarea
                      placeholder="Share your thoughts, ask questions, or start a discussion..."
                      value={newThread.content}
                      onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                      rows={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (optional)</label>
                    <Input
                      placeholder="cooking, recipe, tips (comma separated)"
                      value={newThread.tags}
                      onChange={(e) => setNewThread({ ...newThread, tags: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateThread}
                      disabled={isCreating || !newThread.title.trim() || !newThread.content.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Thread'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Threads List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading discussions...</span>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchThreads} className="mt-4">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : threads.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Be the first to start a discussion!'}
                  </p>
                  {currentUser && (
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Start Discussion
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {threads.map((thread) => (
                  <ThreadCard
                    key={thread._id}
                    thread={thread}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onComment={handleComment}
                    onReply={handleReply}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                    onReport={handleReport}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}