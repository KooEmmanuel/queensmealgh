'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Loader2, RefreshCw, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EditPostModal } from './EditPostModal';

interface InstagramPost {
  _id: string;
  postUrl: string;
  caption: string;
  thumbnail: string;
  likes: number;
  comments: number;
  timestamp: string;
  isPlayable: boolean;
}

const GLOBAL_FETCH_THROTTLE = {
  lastFetch: 0,
  inProgress: false
};

export function InstagramPostsList() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const fetchInProgress = useRef(false);

  const fetchPosts = useCallback(async () => {
    if (GLOBAL_FETCH_THROTTLE.inProgress) {
      console.log('Global fetch already in progress, skipping');
      return;
    }
    
    const now = Date.now();
    if (now - GLOBAL_FETCH_THROTTLE.lastFetch < 5000) {
      console.log('Global rate limiting - too soon to fetch again');
      return;
    }
    
    try {
      GLOBAL_FETCH_THROTTLE.inProgress = true;
      fetchInProgress.current = true;
      setLoading(true);
      setError(null);
      
      const timestamp = new Date().getTime();
      GLOBAL_FETCH_THROTTLE.lastFetch = timestamp;
      setLastFetchTime(timestamp);
      
      const response = await fetch(`/api/admin/instagram?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('Fetched Instagram posts:', data);
      
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', data);
        setError('Invalid data format received from server');
        return;
      }
      
      const formattedPosts = data.map(post => ({
        ...post,
        _id: post._id.toString(),
      }));
      
      setPosts(currentPosts => {
        if (JSON.stringify(currentPosts) === JSON.stringify(formattedPosts)) {
          return currentPosts;
        }
        return formattedPosts;
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
      GLOBAL_FETCH_THROTTLE.inProgress = false;
    }
  }, []);

  useEffect(() => {
    const initialFetchTimer = setTimeout(() => {
      fetchPosts();
    }, 500);
    
    let intervalId: NodeJS.Timeout | null = null;
    
    if (process.env.NODE_ENV === 'production') {
      intervalId = setInterval(() => {
        if (!loading) {
          fetchPosts();
        }
      }, 600000);
    }
    
    return () => {
      if (initialFetchTimer) clearTimeout(initialFetchTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchPosts, loading]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/instagram?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      setPosts(posts.filter(post => post._id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  const handleRefresh = () => {
    fetchPosts();
  };

  const handleEdit = (post: InstagramPost) => {
    setEditingPost(post);
  };

  const handleSaveEdit = async (updatedPost: InstagramPost) => {
    try {
      setPosts(posts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      ));
      
      setEditingPost(null);
      
      alert('Post updated successfully!');
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Loading posts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <CardTitle className="text-lg sm:text-xl">Instagram Posts</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2 text-sm">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            Error: {error}
          </div>
        )}
        
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No Instagram posts found</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {posts.map(post => (
              <div key={post._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 self-center sm:self-auto">
                  {post.thumbnail && post.thumbnail.startsWith('data:') ? (
                    <Image 
                      src={post.thumbnail} 
                      alt={post.caption}
                      fill
                      className="object-cover rounded-md"
                    />
                  ) : post.thumbnail ? (
                    <Image 
                      src={post.thumbnail} 
                      alt={post.caption}
                      fill
                      className="object-cover rounded-md"
                      onError={() => {
                        console.log('Image failed to load:', post.thumbnail);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center text-white font-bold">
                      IG
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0 w-full sm:w-auto">
                  <p className="font-medium text-sm sm:text-base break-words">{post.caption}</p>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                    <span className="mr-3">❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full justify-end sm:w-auto sm:justify-start mt-2 sm:mt-0">
                  <Link href={post.postUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9">
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => handleEdit(post)}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={() => handleDelete(post._id)}
                    disabled={deleting === post._id}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    {deleting === post._id ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <EditPostModal 
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onSave={handleSaveEdit}
      />
    </Card>
  );
} 