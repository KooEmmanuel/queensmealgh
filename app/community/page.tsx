'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Heart, Reply, Send, Loader2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
}

interface Discussion {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
}

export default function CommunityPage() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComments, setNewComments] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discussions");

  // Check if user is logged in on page load
  useEffect(() => {
    const storedUsername = localStorage.getItem('community-username');
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
    }
    
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/community');
      
      if (!response.ok) {
        throw new Error('Failed to fetch discussions');
      }
      
      const data = await response.json();
      setDiscussions(data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setError('Failed to load discussions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/community/username?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check username');
      }
      
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking username:', error);
      return false; // Default to false on error
    }
  };

  const handleLogin = async () => {
    if (username.trim().length < 3) {
      toast({
        title: "Username too short",
        description: "Please enter a username with at least 3 characters",
        variant: "destructive"
      });
      return;
    }
    
    // Check if username already exists
    const exists = await checkUsernameExists(username);
    
    if (exists) {
      toast({
        title: "Username already taken",
        description: "Please choose a different username",
        variant: "destructive"
      });
      return;
    }
    
    // Register the new username
    try {
      const response = await fetch('/api/community/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to register username');
      }
      
      // Save username to localStorage
      localStorage.setItem('community-username', username);
      setIsLoggedIn(true);
      
      toast({
        title: "Welcome to our community!",
        description: `You're now logged in as ${username}`,
      });
    } catch (error) {
      console.error('Error registering username:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to register username",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('community-username');
    
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
    });
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your post",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          author: username,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create discussion');
      }
      
      const newDiscussion = await response.json();
      
      // Update the discussions list
      setDiscussions([newDiscussion, ...discussions]);
      
      // Reset form
      setNewPostTitle('');
      setNewPostContent('');
      
      toast({
        title: "Post created!",
        description: "Your discussion has been posted successfully",
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async (discussionId: string) => {
    const commentContent = newComments[discussionId];
    
    if (!commentContent || !commentContent.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before submitting",
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
          discussionId,
          content: commentContent,
          author: username,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const newComment = await response.json();
      
      // Update the discussions list
      setDiscussions(discussions.map(discussion => {
        if (discussion._id === discussionId) {
          return {
            ...discussion,
            comments: [...discussion.comments, newComment]
          };
        }
        return discussion;
      }));
      
      // Clear the comment input
      setNewComments({
        ...newComments,
        [discussionId]: ''
      });
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLikeDiscussion = async (discussionId: string) => {
    try {
      const response = await fetch('/api/community/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discussionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to like discussion');
      }
      
      // Update the discussions list
      setDiscussions(discussions.map(discussion => {
        if (discussion._id === discussionId) {
          return {
            ...discussion,
            likes: discussion.likes + 1
          };
        }
        return discussion;
      }));
    } catch (error) {
      console.error('Error liking discussion:', error);
      toast({
        title: "Error",
        description: "Failed to like discussion. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const LoginForm = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-bold mb-4">Join the Community</h3>
        <p className="text-gray-600 mb-4">
          Choose a unique username to participate in discussions
        </p>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-grow"
          />
          <Button 
            onClick={handleLogin}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Join
          </Button>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="flex items-center text-gray-600 hover:text-orange-500 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="flex items-center text-gray-600 hover:text-orange-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/community/enhanced">
            <Button className="bg-green-600 hover:bg-green-700">
              <ExternalLink className="h-4 w-4 mr-2" />
              Enhanced Community
            </Button>
          </Link>
          
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{username}</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
          )}
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Queensmeal Community</h1>
      <p className="text-gray-600 mb-8">Join the conversation with fellow food enthusiasts</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="create">Create Post</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-2 text-gray-600">Loading discussions...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
              {error}
              <Button 
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                onClick={fetchDiscussions}
              >
                Try Again
              </Button>
            </div>
          ) : discussions.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-lg text-center">
              <p className="text-gray-600 mb-4">No discussions yet. Be the first to start a conversation!</p>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  // Find the TabsTrigger for the create tab
                  const tabsContainer = document.querySelector('[role="tablist"]');
                  if (tabsContainer) {
                    const createTabTrigger = Array.from(tabsContainer.children)
                      .find(child => child.textContent?.includes('Create Post'));
                    
                    if (createTabTrigger) {
                      (createTabTrigger as HTMLElement).click();
                    }
                  }
                }}
              >
                Create a Post
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {discussions.map((discussion) => (
                <div key={discussion._id} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-2">{discussion.title}</h3>
                  <p className="text-gray-600 mb-4">{discussion.content}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>{discussion.author.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-500">
                        Posted by <span className="font-medium">{discussion.author}</span> • {formatDate(discussion.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        className="flex items-center text-gray-500 hover:text-orange-500"
                        onClick={() => handleLikeDiscussion(discussion._id)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        <span className="text-sm">{discussion.likes}</span>
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-orange-500">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-sm">{discussion.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                  
                  {discussion.comments && discussion.comments.length > 0 && (
                    <div className="border-t pt-4 mt-4 space-y-4">
                      <h4 className="font-medium text-sm text-gray-700">Comments</h4>
                      
                      {discussion.comments.map((comment) => (
                        <div key={comment._id} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center mb-2">
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-gray-500 ml-2">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center mt-4 pt-4 border-t">
                    <Input 
                      placeholder="Add a comment..." 
                      className="mr-2"
                      value={newComments[discussion._id] || ''}
                      onChange={(e) => setNewComments({
                        ...newComments,
                        [discussion._id]: e.target.value
                      })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(discussion._id);
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleAddComment(discussion._id)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Create a New Discussion</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input 
                  id="post-title"
                  placeholder="What's your discussion about?" 
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <Textarea 
                  id="post-content"
                  placeholder="Share your thoughts, questions, or recipes..." 
                  rows={6}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>
              
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleCreatePost}
              >
                Post Discussion
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 