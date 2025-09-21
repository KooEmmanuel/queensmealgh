'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Eye, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
      
      {/* Category pills for filtering */}
      <div className="mb-8">
        <CategoryPills 
          activeCategory={activeCategory} 
          onCategoryChange={handleCategoryChange} 
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {videos.map((video) => (
          <Card key={video._id} className="overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="p-3">
              <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                {video.title || "TikTok Video"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative aspect-video flex-grow">
              {video.thumbnail ? (
                <Image
                  src={video.thumbnail}
                  alt={video.title || "TikTok video thumbnail"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                  TT
                </div>
              )}
              {video.isPlayable && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white/80" />
                </div>
              )}
            </CardContent>
            <CardFooter className="p-3 flex justify-between items-center text-xs text-gray-600 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span>{video.views || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{video.duration || 'N/A'}</span>
              </div>
              <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" passHref>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="sr-only">View on TikTok</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
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
        <div className="flex space-x-2">
          {categories.map(category => (
            <Badge 
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={`px-4 py-2 cursor-pointer whitespace-nowrap font-karla ${
                activeCategory === category.id 
                  ? 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white' 
                  : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border-gray-200'
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
} 