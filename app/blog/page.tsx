'use client';

import { useState, useEffect } from 'react';
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, Filter, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { BlogPost } from '@/types/blog-post';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog/all');
      const data: any = await response.json(); 

      let postsArray: BlogPost[] = []; // Initialize as empty array

      // Check structure and extract the array correctly
      if (data && typeof data === 'object' && Array.isArray(data.posts)) {
        postsArray = data.posts;
      } else if (Array.isArray(data)) {
        postsArray = data;
      } else {
        console.warn('Unexpected API response format for blog posts:', data);
      }
      
      setPosts(postsArray); // Always set an array

    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);
  
  const filteredPosts = Array.isArray(posts) 
    ? posts.filter(post => 
        (post.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (post.excerpt?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (post.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : [];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cooking Journal</h1>
          <p className="text-xl max-w-2xl">
            Explore our collection of articles, tips, and stories about cooking and food.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg 
            className="relative block w-full h-[60px]" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              fill="#f8fafc"
            />
          </svg>
        </div>
      </div>
      
      {/* Search section */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-10 border-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 shadow-sm">
            <Filter size={18} />
            Categories
            <ChevronDown size={16} />
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found matching your search.</p>
            {searchTerm && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/blog/${post._id}`} className="block">
                  <div className="relative h-48 w-full bg-gray-100">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
                        {post.category}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-gray-200 mr-2 overflow-hidden flex-shrink-0">
                          {post.author.avatar ? (
                            <Image
                              src={post.author.avatar}
                              alt={post.author.name}
                              width={24}
                              height={24}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-500 text-white text-xs font-semibold">
                              {post.author.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 truncate">{post.author.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
