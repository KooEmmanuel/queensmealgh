"use client";

import { useState, useEffect } from 'react';
import { useSSE } from '@/hooks/useSSE';
import { Button } from "@/components/ui/button";
import { UserProfile, Thread, Comment, Reply } from '@/types/community';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { UserAuth } from "@/components/community/UserAuth";
import { ThreadCard } from "@/components/community/ThreadCard";
import { ProfilePhotoUpload } from "@/components/community/ProfilePhotoUpload";
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
  LogOut,
  ChevronDown,
  User,
  Camera
} from "lucide-react";
import Footer from '@/components/Footer';
import Link from "next/link";


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

  // SSE connection for real-time updates
  const { isConnected, connectionStatus } = useSSE('/api/community/events', {
    onMessage: (event) => {
      console.log('SSE event received:', event);
      
      switch (event.type) {
        case 'new_thread':
          setThreads(prev => [event.data, ...prev]);
          toast({
            title: "New Thread!",
            description: `${event.data.authorDisplayName} created a new thread: ${event.data.title}`,
          });
          break;
          
        case 'new_comment':
          setThreads(prev => prev.map(thread => 
            thread._id === event.data.threadId 
              ? { ...thread, comments: [...thread.comments, event.data.comment] }
              : thread
          ));
          toast({
            title: "New Comment!",
            description: `${event.data.comment.authorDisplayName} commented on a thread`,
          });
          break;
          
        case 'thread_liked':
          setThreads(prev => prev.map(thread => 
            thread._id === event.data.threadId 
              ? { ...thread, likes: thread.likes + 1 }
              : thread
          ));
          break;
          
        case 'comment_liked':
          setThreads(prev => prev.map(thread => 
            thread._id === event.data.threadId 
              ? {
                  ...thread,
                  comments: thread.comments.map(comment =>
                    comment._id === event.data.commentId
                      ? { ...comment, likes: comment.likes + 1 }
                      : comment
                  )
                }
              : thread
          ));
          break;
          
        case 'connected':
          console.log('Connected to real-time updates');
          break;
          
        case 'ping':
          // Keep connection alive
          break;
      }
    },
    onError: (error) => {
      // Only log critical errors, not connection issues
      if (error && typeof error === 'object' && Object.keys(error).length > 0) {
        console.error('SSE connection error:', error);
      }
    },
    onOpen: () => {
      console.log('SSE connection opened');
    },
    onClose: () => {
      console.log('SSE connection closed');
    }
  });

  useEffect(() => {
    fetchThreads();
  }, [sortBy, category, searchTerm]);

  const trackViews = async (threadIds: string[]) => {
    try {
      await fetch('/api/community/track-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadIds }),
      });
    } catch (error) {
      console.error('Error tracking views:', error);
    }
  };

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
        setThreads(data.threads || []);
        // Track views for all threads
        const threadIds = data.threads?.map((thread: Thread) => thread._id) || [];
        if (threadIds.length > 0) {
          trackViews(threadIds);
        }
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
    // Ensure all required properties are initialized
    const safeUser = {
      ...user,
      badges: user.badges || [],
      postCount: user.postCount || 0,
      commentCount: user.commentCount || 0,
      likeCount: user.likeCount || 0,
      reputation: user.reputation || 0
    };
    setCurrentUser(safeUser);
  };

  const refreshUserData = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/community/users/${currentUser.username}`);
      const data = await response.json();
      
      if (data.success && data.user) {
        const updatedUser = {
          ...data.user,
          badges: data.user.badges || [],
          postCount: data.user.postCount || 0,
          commentCount: data.user.commentCount || 0,
          likeCount: data.user.likeCount || 0,
          reputation: data.user.reputation || 0
        };
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        avatar: photoUrl
      });
    }
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
      
      const requestBody = {
        title: newThread.title,
        content: newThread.content,
        category: newThread.category,
        tags: tags,
        author: currentUser.username,
      };
      
      console.log('Sending thread data:', requestBody);
      
      const response = await fetch('/api/community/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      console.log('API Response:', data);

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
        // Refresh user data to update post count
        refreshUserData();
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to create thread',
          variant: "destructive",
        });
        return;
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
      console.log('Liking thread:', threadId);
      console.log('User ID:', currentUser._id);
      
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
      console.log('Like response:', data);

      if (data.success) {
        fetchThreads();
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to like thread',
          variant: "destructive",
        });
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

  const handleCommentLike = async (commentId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the thread that contains this comment
      const thread = threads.find(t => 
        t.comments && t.comments.some(c => c._id === commentId)
      );

      if (!thread) {
        toast({
          title: "Error",
          description: "Thread not found.",
          variant: "destructive",
        });
        return;
      }

      console.log('Liking comment:', commentId, 'in thread:', thread._id);
      
      const response = await fetch('/api/community/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: thread._id,
          commentId: commentId,
          userId: currentUser._id,
        }),
      });

      const data = await response.json();
      console.log('Comment like response:', data);

      if (data.success) {
        fetchThreads();
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to like comment',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: "Error",
        description: "Failed to like comment. Please try again.",
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
        // Refresh user data to update comment count
        refreshUserData();
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

  const handleReply = async (commentId: string, content: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to reply to comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the thread that contains this comment
      const thread = threads.find(t => 
        t.comments && t.comments.some(c => c._id === commentId)
      );

      if (!thread) {
        toast({
          title: "Error",
          description: "Thread not found.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/community/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: thread._id,
          commentId: commentId,
          content: content,
          authorId: currentUser._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Reply Added",
          description: "Your reply has been added successfully!",
        });
        // Refresh threads to show the new reply
        fetchThreads();
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to add reply',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = (threadId: string) => {
    // TODO: Implement bookmark functionality
    toast({
      title: "Bookmarked",
      description: "Thread has been bookmarked!",
    });
  };

  const handleShare = async (thread: Thread) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: thread.title,
          text: thread.content,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Thread link has been copied to clipboard!",
        });
      }
    } catch (error) {
      // Handle share cancellation or other errors silently
      if (error && typeof error === 'object' && error !== null && 'name' in error && error.name !== 'AbortError') {
        console.error('Share error:', error);
        // Fallback to clipboard on error
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Link Copied",
            description: "Thread link has been copied to clipboard!",
          });
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
        }
      }
    }
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="shrink-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-bold text-gradient-green-orange truncate">Community</h1>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 
                      connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`} />
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      {isConnected ? 'Live' : 
                       connectionStatus === 'connecting' ? 'Connecting...' : 
                       'Offline'}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Connect with fellow food enthusiasts
                  {isConnected && <span className="text-green-600 ml-1">• Real-time updates</span>}
                </p>
              </div>
            </div>
            
            {currentUser && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-medium shrink-0"
                  size="sm"
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">New Thread</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 relative group">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-orange-400 flex items-center justify-center">
                        {currentUser.avatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
                            <AvatarFallback className="bg-gradient-to-br from-green-400 to-orange-400 text-white text-sm font-bold">
                              {currentUser.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {currentUser.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-3 w-3 text-white" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          @{currentUser.username}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center justify-between">
                      <span className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Posts
                      </span>
                      <span className="text-sm font-medium">{currentUser.postCount}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center justify-between">
                      <span className="flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Comments
                      </span>
                      <span className="text-sm font-medium">{currentUser.commentCount}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center justify-between">
                      <span className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Reputation
                      </span>
                      <span className="text-sm font-medium">{currentUser.reputation}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        // Open photo upload dialog
                        const event = new CustomEvent('openPhotoUpload');
                        window.dispatchEvent(event);
                      }}
                      className="text-blue-600 focus:text-blue-600"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleUserLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* User Authentication */}
        {!currentUser && (
          <div className="mb-8">
            <UserAuth onUserLogin={handleUserLogin} onUserLogout={handleUserLogout} />
          </div>
        )}


        {/* Create Thread Form */}
        {showCreateForm && currentUser && currentUser.displayName && (
          <div className="mb-6 sm:mb-8">
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl text-gradient-green-orange">Create New Thread</CardTitle>
                <CardDescription className="text-sm text-gray-600">
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
                    className="w-full border-green-200 focus:border-orange-500 focus:ring-orange-500 bg-white/80"
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
                    <SelectTrigger className="border-green-200 focus:border-orange-500 bg-white/80">
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
                    className="w-full border-green-200 focus:border-orange-500 focus:ring-orange-500 bg-white/80"
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
                    className="w-full border-green-200 focus:border-orange-500 focus:ring-orange-500 bg-white/80"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={handleCreateThread}
                    disabled={isCreating}
                    className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-medium flex-1 sm:flex-none"
                  >
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Thread
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 sm:flex-none border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
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
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
                    <Input
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 sm:h-11 border-green-200 focus:border-orange-500 focus:ring-orange-500 bg-white/80"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 border-green-200 focus:border-orange-500 bg-white/80">
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
                    <SelectTrigger className="w-full sm:w-40 h-10 sm:h-11 border-green-200 focus:border-orange-500 bg-white/80">
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
              <div className="text-center">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-gradient-green-orange mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading discussions...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
              <CardContent className="p-6 sm:p-8 text-center">
                <p className="text-red-600 mb-4 text-sm sm:text-base font-medium">{error}</p>
                <Button onClick={fetchThreads} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : !threads || threads.length === 0 ? (
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6 sm:p-8 text-center">
                <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-gradient-green-orange mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  No discussions yet
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Be the first to start a conversation in our food community!
                </p>
                {currentUser && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-medium"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            threads && threads.map((thread) => (
              <ThreadCard
                key={thread._id}
                thread={thread}
                currentUser={currentUser}
                onLike={handleLike}
                onComment={handleComment}
                onReply={handleReply}
                onCommentLike={handleCommentLike}
                onBookmark={handleBookmark}
                onShare={handleShare}
                onReport={handleReport}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Hidden ProfilePhotoUpload component */}
      {currentUser && (
        <ProfilePhotoUpload 
          currentUser={currentUser} 
          onPhotoUpdate={handlePhotoUpdate}
        />
      )}
      
      <Footer />
    </div>
  );
}