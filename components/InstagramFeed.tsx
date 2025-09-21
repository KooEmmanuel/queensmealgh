'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Instagram, Heart, MessageCircle, Clock, AlertCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstagramPost {
  _id: string;
  thumbnail: string;
  caption: string;
  postUrl: string;
  likes: number;
  comments: number;
  timestamp: string;
  isPlayable: boolean;
}

interface InstagramCategory {
  id: string;
  name: string;
}

export function getInstagramCategories() {
  return [
    { id: '1', name: 'Popular' },
    { id: '2', name: 'Recent' },
    { id: '3', name: 'Food' },
    { id: '4', name: 'Recipes' },
    { id: '5', name: 'Videos' },
  ];
}

// Get relevant image based on caption
const getRelevantImage = (caption: string) => {
  // Extract main dish name from caption
  const extractMainDish = (caption: string) => {
    // Remove hashtags
    const withoutHashtags = caption.replace(/#\w+/g, '').trim();
    
    // Common African dishes to look for
    const dishes = [
      'jollof', 'rice', 'plantain', 'egusi', 'soup', 'akara', 'pap', 
      'yam', 'pounded', 'meat pie', 'fufu', 'moin moin', 'suya', 
      'ogbono', 'efo', 'okra', 'stew', 'beans', 'moi moi'
    ];
    
    // Find the first dish mentioned in the caption
    for (const dish of dishes) {
      if (withoutHashtags.toLowerCase().includes(dish)) {
        return dish;
      }
    }
    
    // If no specific dish found, return first few words
    return withoutHashtags.split(' ').slice(0, 2).join(' ');
  };
  
  const mainDish = extractMainDish(caption);
  
  // Map of dish keywords to specific relevant images
  const dishImageMap: Record<string, string> = {
    'jollof': 'https://images.unsplash.com/photo-1634649473045-7bbbb6e3a9f1?q=80&w=600&auto=format&fit=crop',
    'rice': 'https://images.unsplash.com/photo-1634649473045-7bbbb6e3a9f1?q=80&w=600&auto=format&fit=crop',
    'plantain': 'https://images.unsplash.com/photo-1593280405106-e438cce7c207?q=80&w=600&auto=format&fit=crop',
    'egusi': 'https://images.unsplash.com/photo-1643456370644-b966b4af2e0d?q=80&w=600&auto=format&fit=crop',
    'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=600&auto=format&fit=crop',
    'akara': 'https://images.unsplash.com/photo-1562059390-a761a084768e?q=80&w=600&auto=format&fit=crop',
    'pap': 'https://images.unsplash.com/photo-1575260279991-0faff7074aa7?q=80&w=600&auto=format&fit=crop',
    'yam': 'https://images.unsplash.com/photo-1598511726623-d2e9996e1b6c?q=80&w=600&auto=format&fit=crop',
    'pounded': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=600&auto=format&fit=crop',
    'meat pie': 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?q=80&w=600&auto=format&fit=crop',
    'fufu': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=600&auto=format&fit=crop',
    'moin moin': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
    'suya': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop',
    'stew': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop',
    'beans': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop',
    'moi moi': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
  };
  
  // Return specific image for the dish if available
  if (mainDish in dishImageMap) {
    return dishImageMap[mainDish];
  }
  
  // Fallback to a generic African food image if no specific match
  const genericAfricanFoodImages = [
    'https://images.unsplash.com/photo-1634649473045-7bbbb6e3a9f1?q=80&w=600&auto=format&fit=crop', // Jollof rice
    'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=600&auto=format&fit=crop', // Fufu and soup
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop', // Colorful African dish
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop', // Stew
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop'  // Grilled meat
  ];
  
  // Use hash of caption to consistently select the same image for the same caption
  const hashCode = caption.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return genericAfricanFoodImages[hashCode % genericAfricanFoodImages.length];
};

interface InstagramFeedProps {
  username?: string; // Make username optional
}

// Move this utility function to the top of the file (outside any components)
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function(...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export default function InstagramFeed({ username = "queensmeal12" }: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [categories, setCategories] = useState<InstagramCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('1');
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const feedRef = useRef<HTMLDivElement>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Function to update metrics in real-time
  const updateMetrics = async () => {
    // If already polling, skip this update
    if (isPolling) return;
    
    try {
      setIsPolling(true);
      
      // Update metrics for each post
      const updatedPosts = [...posts];
      
      for (let i = 0; i < updatedPosts.length; i++) {
        const post = updatedPosts[i];
        try {
          const response = await fetch(`/api/instagram/metrics?postId=${post._id}`);
          
          if (response.ok) {
            const metrics = await response.json();
            updatedPosts[i] = {
              ...post,
              likes: metrics.likes,
              comments: metrics.comments
            };
          }
        } catch (err) {
          console.warn(`Failed to update metrics for post ${post._id}`, err);
          // Continue with other posts even if one fails
        }
      }
      
      // Only update state if component is still mounted and posts array hasn't changed length
      if (updatedPosts.length === posts.length) {
        setPosts(updatedPosts);
      }
    } catch (err) {
      console.error('Error updating metrics:', err);
    } finally {
      setIsPolling(false);
    }
  };

  // Create the debounced version inside the component
  const debouncedUpdateMetrics = debounce(updateMetrics, 1000);

  useEffect(() => {
    // Check if the API supports category filtering
    const checkCategorySupport = async () => {
      try {
        const response = await fetch('/api/instagram/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          // If the API doesn't support categories yet, use the local function
          setCategories(getInstagramCategories());
        }
      } catch (err) {
        console.warn('Category API not available, using local categories');
        setCategories(getInstagramCategories());
      }
    };
    
    checkCategorySupport();
    
    // Fetch posts
    const fetchPosts = async () => {
      try {
        if (!hasLoadedOnce) {
          setLoading(true);
        }
        setError(null);
        
        // Don't include category parameter until we know the API supports it
        const response = await fetch('/api/instagram', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch Instagram posts');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }
        
        setPosts(data);
        setHasLoadedOnce(true);
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error fetching Instagram posts:', error);
        setError('Failed to load Instagram posts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
    
    // IMPORTANT: Only set up polling if this is not the admin section
    // This prevents duplicate polling from both components
    const isAdminPage = window.location.pathname.includes('/admin');
    
    if (!isAdminPage) {
      // Set up polling with a more reliable approach
      let isMounted = true;
      let metricsInterval: NodeJS.Timeout | null = null;
      
      // Start polling after initial fetch
      const startPolling = () => {
        // Clear any existing interval first
        if (metricsInterval) clearInterval(metricsInterval);
        
        // Set up new interval with the debounced function
        metricsInterval = setInterval(() => {
          if (isMounted && !isPolling) {
            debouncedUpdateMetrics();
          }
        }, 60000);
      };
      
      // Start polling after a delay to ensure initial render is complete
      const initTimer = setTimeout(() => {
        startPolling();
      }, 5000);
      
      // Cleanup function
      return () => {
        isMounted = false;
        if (metricsInterval) clearInterval(metricsInterval);
        clearTimeout(initTimer);
      };
    }
    
    // If we're on the admin page, just return a simple cleanup function
    return () => {};
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // For now, just update the UI without trying to fetch new data
    // This ensures the feed doesn't disappear
    
    // TODO: Implement proper category filtering when the API supports it
  };

  const handleImageError = (postId: string) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [postId]: true
    }));
  };

  if (loading && !hasLoadedOnce) {
    return (
      <div className="text-center py-10">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 font-sourcesans text-gray-600">Loading Instagram posts...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 font-sourcesans">{error}</div>;
  }

  return (
    <div ref={feedRef}>
      <div className="mb-8">
        <InstagramCategoryPills 
          activeCategory={activeCategory} 
          onCategoryChange={handleCategoryChange} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <div 
            key={post._id} 
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative h-64 group">
              {imageLoadErrors[post._id] ? (
                // Fallback UI when image fails to load
                <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-4 text-gray-400">
                  <ImageIcon className="h-16 w-16 mb-2" />
                  <p className="text-center font-karla">Image not available</p>
                </div>
              ) : (
                <Image
                  src={post.thumbnail || ''}
                  alt={post.caption}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(post._id)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 3} // Prioritize loading the first 3 images
                />
              )}
              
              {/* Overlay with Instagram icon */}
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Link href={post.postUrl} target="_blank" rel="noopener noreferrer">
                  <Button 
                    className="bg-gradient-to-tr from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full p-3"
                    size="icon"
                  >
                    <Instagram className="h-8 w-8 text-white" />
                  </Button>
                </Link>
              </div>
              
              {/* Instagram badge */}
              <div className="absolute top-3 right-3 bg-gradient-to-tr from-purple-600 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Instagram className="h-3 w-3 mr-1" />
                Instagram
              </div>
              
              {/* Timestamp badge */}
              {post.timestamp && (
                <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {post.timestamp}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <p className="font-karla text-sm mb-3 line-clamp-2 text-gray-700">{post.caption}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 font-sourcesans">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center mr-2 text-xs text-white">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span>@{username}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1 text-red-500" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
              
              <Link 
                href={post.postUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-block text-purple-600 hover:text-purple-700 font-karla font-medium text-sm"
              >
                View on Instagram →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InstagramCategoryPills({ 
  activeCategory = '1',
  onCategoryChange = () => {}
}: { 
  activeCategory?: string,
  onCategoryChange?: (id: string) => void
}) {
  const [categories, setCategories] = useState<InstagramCategory[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setCategories(getInstagramCategories());
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-gray-200'
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