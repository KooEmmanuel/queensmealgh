'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface TikTokVideo {
  _id: string;
  videoUrl: string;
  title: string;
  thumbnail: string;
  views: string;
  duration: string;
  isPlayable: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface TikTokCategory {
  id: string;
  name: string;
}

interface CategoryPillsProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export function TikTokFeed() {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('1');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add category parameter to fetch different videos based on category
        const response = await fetch(`/api/tiktok?category=${activeCategory}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch TikTok videos');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }
        
        setVideos(data);
      } catch (error) {
        console.error('Error fetching TikTok videos:', error);
        setError('Failed to load TikTok videos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [activeCategory]); // Re-fetch when category changes

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2">Loading TikTok Feed...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <p>Error loading TikTok feed: {error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return <p className="text-center text-gray-500 py-10">No TikTok videos available right now.</p>;
  }

  return (
    <div className="w-full">
      
      {/* Modern Category pills for filtering */}
      <div className="mb-8">
        <CategoryPills 
          activeCategory={activeCategory} 
          onCategoryChange={handleCategoryChange} 
        />
      </div>
      
      {/* Modern Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Card className="overflow-hidden flex flex-col h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-semibold leading-tight line-clamp-2 text-gray-800 group-hover:text-green-600 transition-colors">
                  {video.title || "TikTok Video"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative aspect-video flex-grow">
                {video.thumbnail ? (
                  <Image
                    src={video.thumbnail}
                    alt={video.title || "TikTok video thumbnail"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-2xl">
                    TT
                  </div>
                )}
                {video.isPlayable && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 rounded-full p-3 shadow-lg">
                      <Play className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                )}
                {/* Modern overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
              <CardFooter className="p-4 pt-2 flex justify-center items-center text-xs text-gray-600 bg-gradient-to-r from-gray-50/50 to-white/50">
                <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" passHref>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-600 hover:text-green-700 transition-all duration-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View on TikTok</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function CategoryPills({ activeCategory, onCategoryChange }: CategoryPillsProps) {
  const [categories, setCategories] = useState<TikTokCategory[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  function getTikTokCategories(): TikTokCategory[] {
    return [
      { id: '1', name: 'Popular' },
      { id: '2', name: 'Recent' },
      { id: '3', name: 'African' },
      { id: '4', name: 'Breakfast' },
      { id: '5', name: 'Dinner' },
      { id: '6', name: 'Quick Meals' },
    ];
  }

  useEffect(() => {
    setCategories(getTikTokCategories());
  }, []);
  
  return (
    <div className="relative">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto pb-2 scrollbar-hide snap-x"
      >
        <div className="flex space-x-3">
          {categories.map(category => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 cursor-pointer whitespace-nowrap font-karla rounded-full transition-all duration-300 ${
                activeCategory === category.id 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25' 
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200/50 hover:border-green-200 shadow-sm hover:shadow-md'
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
} 