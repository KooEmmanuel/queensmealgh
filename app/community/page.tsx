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
  ArrowLeft,
  LogOut
} from "lucide-react";
import Footer from '@/components/Footer';
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
  authorId: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  views: number;
  isPinned?: boolean;
  isLocked?: boolean;
}

export default function CommunityPage() {
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
        title: "Authentication Required",
        description: "Please log in to create a thread.",
        variant: "destructive",
      });
      return;
    }

    if (!newThread.title.trim() || !newThread.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      
      const tags = newThread.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await fetch('/api/community/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newThread.title,
          content: newThread.content,
          category: newThread.category,
          tags: tags,
          authorId: currentUser._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Thread Created",
          description: "Your discussion thread has been created successfully!",
        });
        
        setNewThread({
          title: '',
          content: '',
          category: 'general',
          tags: ''
        });
        setShowCreateForm(false);
        fetchThreads();
      } else {
        throw new Error(data.error || 'Failed to create thread');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: "Error",
        description: "Failed to create thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLike = async (threadId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like threads.",
        variant: "destructive",
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
          threadId: threadId,
          userId: currentUser._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchThreads();
      } else {
        throw new Error(data.error || 'Failed to like thread');
      }
    } catch (error) {
      console.error('Error liking thread:', error);
      toast({
        title: "Error",
        description: "Failed to like thread. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (threadId: string, content: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment.",
        variant: "destructive",
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
          threadId: threadId,
          content: content,
          authorId: currentUser._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Comment Added",
          description: "Your comment has been added successfully!",
        });
        fetchThreads();
      } else {
        throw new Error(data.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReport = (threadId: string) => {
    toast({
      title: "Content Reported",
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
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="shrink-0">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Community</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Connect with fellow food enthusiasts</p>
              </div>
            </div>
            
            {currentUser && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 shrink-0"
                size="sm"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Thread</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* User Authentication */}
        {!currentUser && (
          <div className="mb-8">
            <UserAuth onLogin={handleUserLogin} />
          </div>
        )}

        {/* User Profile */}
        {currentUser && (
          <div className="mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <span className="text-sm sm:text-lg font-semibold text-green-600">
                        {currentUser.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{currentUser.displayName}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">@{currentUser.username}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                        <span className="text-xs sm:text-sm text-gray-500">
                          {currentUser.postCount} posts
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {currentUser.reputation} reputation
                        </span>
                        {currentUser.badges.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {currentUser.badges.slice(0, 2).map((badge, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                            {currentUser.badges.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{currentUser.badges.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleUserLogout} size="sm" className="shrink-0">
                    <span className="hidden sm:inline">Logout</span>
                    <LogOut className="h-4 w-4 sm:hidden" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Thread Form */}
        {showCreateForm && currentUser && (
          <div className="mb-6 sm:mb-8">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Create New Thread</CardTitle>
                <CardDescription className="text-sm">
                  Start a new discussion with the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Input
                    value={newThread.title}
                    onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                    placeholder="Enter thread title..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={newThread.category}
                    onValueChange={(value) => setNewThread({...newThread, category: value})}
                  >
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <Textarea
                    value={newThread.content}
                    onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                    placeholder="Share your thoughts..."
                    rows={6}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={newThread.tags}
                    onChange={(e) => setNewThread({...newThread, tags: e.target.value})}
                    placeholder="cooking, tips, beginner..."
                    className="w-full"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={handleCreateThread}
                    disabled={isCreating}
                    className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  >
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Thread
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 sm:h-11"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40 h-10 sm:h-11">
                      <SelectValue />
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
        </div>

        {/* Threads List */}
        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-green-600" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
                <Button onClick={fetchThreads} variant="outline" size="sm">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : threads.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No discussions yet
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Be the first to start a conversation!
                </p>
                {currentUser && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            threads.map((thread) => (
              <ThreadCard
                key={thread._id}
                thread={thread}
                currentUser={currentUser}
                onLike={handleLike}
                onComment={handleComment}
                onReport={handleReport}
              />
            ))
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}