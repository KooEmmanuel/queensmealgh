'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Loader2, RefreshCw, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EditTikTokModal } from './EditTikTokModal';

interface TikTokPost {
  _id: string;
  videoUrl: string;
  title: string;
  thumbnail: string;
  views: string;
  duration: string;
  isPlayable: boolean;
}

export function TikTokPostsList() {
  const [posts, setPosts] = useState<TikTokPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<TikTokPost | null>(null);

  // Use useCallback to memoize the fetchPosts function
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add a timestamp to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/tiktok?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Log the data to help debug
      console.log('Fetched TikTok videos:', data);
      
      // Ensure we're getting an array
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', data);
        setError('Invalid data format received from server');
        return;
      }
      
      // Map the data to ensure ObjectId is properly handled
      const formattedPosts = data.map(post => ({
        ...post,
        _id: post._id.toString(), // Ensure _id is a string
      }));
      
      // Use a functional update to ensure we're working with the latest state
      setPosts(currentPosts => {
        // If the data is the same, don't update state to avoid re-renders
        if (JSON.stringify(currentPosts) === JSON.stringify(formattedPosts)) {
          return currentPosts;
        }
        return formattedPosts;
      });
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPosts();
    
    // Set up a polling interval with a longer duration
    const intervalId = setInterval(() => {
      // Only fetch if not currently loading
      if (!loading) {
        fetchPosts();
      }
    }, 60000); // Refresh every 60 seconds
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchPosts, loading]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/tiktok?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }
      
      setPosts(posts.filter(post => post._id !== id));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    } finally {
      setDeleting(null);
    }
  };

  const handleRefresh = () => {
    fetchPosts();
  };

  const handleEdit = (post: TikTokPost) => {
    setEditingPost(post);
  };

  const handleSaveEdit = async (updatedPost: TikTokPost) => {
    try {
      // Update the post in the local state
      setPosts(posts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      ));
      
      // Close the modal
      setEditingPost(null);
      
      // Show success message
      alert('Video updated successfully!');
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Loading videos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>TikTok Videos</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            Error: {error}
          </div>
        )}
        
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No TikTok videos found</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 self-center sm:self-auto">
                  {post.thumbnail && post.thumbnail.startsWith('data:') ? (
                    <Image 
                      src={post.thumbnail} 
                      alt={post.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  ) : post.thumbnail ? (
                    <Image 
                      src={post.thumbnail} 
                      alt={post.title}
                      fill
                      className="object-cover rounded-md"
                      onError={() => {
                        console.log('Image failed to load:', post.thumbnail);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 rounded-md flex items-center justify-center text-white font-bold">
                      TT
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0 w-full sm:w-auto">
                  <p className="font-medium text-sm sm:text-base break-words">{post.title}</p>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                    <span className="mr-3">👁️ {post.views}</span>
                    <span>⏱️ {post.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full justify-end sm:w-auto sm:justify-start mt-2 sm:mt-0">
                  <Link href={post.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => handleEdit(post)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={() => handleDelete(post._id)}
                    disabled={deleting === post._id}
                  >
                    {deleting === post._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <EditTikTokModal 
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onSave={handleSaveEdit}
      />
    </Card>
  );
} 