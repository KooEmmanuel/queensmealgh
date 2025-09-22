"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Image, Video } from "lucide-react";
import { toast } from "sonner";

interface TikTokPost {
  id: string;
  thumbnail: string;
  title: string;
  videoUrl?: string;
  username: string;
  createdAt: string;
  views?: number;
  likes?: number;
  comments?: number;
}

export function TikTokContentFetcher() {
  const [htmlContent, setHtmlContent] = useState('');
  const [extractedPosts, setExtractedPosts] = useState<TikTokPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [username, setUsername] = useState('queens_meal');
  const [testingThumbnail, setTestingThumbnail] = useState<string | null>(null);

  const extractTikTokData = (html: string): TikTokPost[] => {
    const posts: TikTokPost[] = [];
    
    try {
      console.log('🔍 Parsing HTML for TikTok data...');
      
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Look for video container elements with the specific TikTok structure
      const videoContainers = doc.querySelectorAll('[data-e2e="user-post-item"]');
      console.log(`📊 Found ${videoContainers.length} video containers`);
      
      videoContainers.forEach((container, index) => {
        try {
          // Find the video link within this container
          const videoLink = container.querySelector('a[href*="/video/"]');
          if (!videoLink) return;
          
          const href = videoLink.getAttribute('href');
          if (!href) return;
          
          const videoIdMatch = href.match(/\/video\/(\d+)/);
          if (!videoIdMatch) return;
          
          const videoId = videoIdMatch[1];
          console.log(`✅ Found video ID: ${videoId} from link: ${href}`);
          
          // Check if we already have this video ID
          if (posts.find(p => p.id === videoId)) return;
          
          // Find the thumbnail image within this container
          const thumbnailImg = container.querySelector('img[src*="tiktokcdn"]');
          let thumbnail = '';
          let title = `Queens Meal Video ${videoId}`;
          
          if (thumbnailImg) {
            thumbnail = thumbnailImg.getAttribute('src') || '';
            const alt = thumbnailImg.getAttribute('alt') || '';
            
            // Extract title from alt text
            if (alt) {
              let extractedTitle = alt.replace(/created by.*$/i, '').trim();
              extractedTitle = extractedTitle.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
              
              if (extractedTitle && extractedTitle.length > 0) {
                if (extractedTitle.length > 100) {
                  extractedTitle = extractedTitle.substring(0, 97) + '...';
                }
                title = extractedTitle;
                console.log(`📝 Extracted title: ${title}`);
              }
            }
          }
          
          // Find view count if available
          const viewElement = container.querySelector('[data-e2e="video-views"]');
          let views = 0;
          if (viewElement) {
            const viewText = viewElement.textContent || '';
            // Parse view count (e.g., "2.1M", "959.5K", "4721")
            const viewMatch = viewText.match(/([\d.]+)([KMB]?)/);
            if (viewMatch) {
              const num = parseFloat(viewMatch[1]);
              const suffix = viewMatch[2];
              if (suffix === 'K') views = Math.round(num * 1000);
              else if (suffix === 'M') views = Math.round(num * 1000000);
              else if (suffix === 'B') views = Math.round(num * 1000000000);
              else views = num;
            }
          }
          
          posts.push({
            id: videoId,
            thumbnail: thumbnail,
            title: title,
            videoUrl: `https://www.tiktok.com/@${username}/video/${videoId}`,
            username: username,
            createdAt: new Date().toISOString(),
            views: views
          });
          
          console.log(`✅ Added post: ${videoId} - ${title} - Views: ${views}`);
          
        } catch (error) {
          console.error(`❌ Error processing container ${index}:`, error);
        }
      });
      
      // Fallback: Look for any video links not captured above
      const allVideoLinks = doc.querySelectorAll('a[href*="/video/"]');
      console.log(`📊 Found ${allVideoLinks.length} total video links`);
      
      allVideoLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const videoIdMatch = href.match(/\/video\/(\d+)/);
          if (videoIdMatch) {
            const videoId = videoIdMatch[1];
            
            // Check if we already have this video ID
            if (!posts.find(p => p.id === videoId)) {
              console.log(`🔄 Adding fallback video: ${videoId}`);
              
              // Try to find a thumbnail for this video
              let thumbnail = '';
              const nearbyImg = link.querySelector('img[src*="tiktokcdn"]') || 
                               link.parentElement?.querySelector('img[src*="tiktokcdn"]');
              if (nearbyImg) {
                thumbnail = nearbyImg.getAttribute('src') || '';
              }
              
              posts.push({
                id: videoId,
                thumbnail: thumbnail,
                title: `Queens Meal Video ${videoId}`,
                videoUrl: `https://www.tiktok.com/@${username}/video/${videoId}`,
                username: username,
                createdAt: new Date().toISOString()
              });
              console.log(`🖼️ Created fallback post ${videoId}`);
            }
          }
        }
      });
      
      console.log(`🎬 Total posts extracted: ${posts.length}`);
      
    } catch (error) {
      console.error('Error parsing HTML:', error);
      toast.error('Failed to parse HTML content');
    }
    
    return posts;
  };

  const handleExtract = () => {
    if (!htmlContent.trim()) {
      toast.error('Please paste HTML content first');
      return;
    }
    
    setLoading(true);
    try {
      const posts = extractTikTokData(htmlContent);
      setExtractedPosts(posts);
      toast.success(`Extracted ${posts.length} TikTok posts`);
    } catch (error) {
      toast.error('Failed to extract data');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFromUsername = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    setLoading(true);
    console.log(`🔍 Fetching content from @${username}...`);
    
    try {
      const response = await fetch('/api/tiktok/fetch-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      console.log('📊 API Response:', data);

      if (data.success) {
        setExtractedPosts(data.videos);
        console.log(`✅ Successfully fetched ${data.count} videos:`, data.videos);
        
        if (data.count > 0) {
          toast.success(`🎉 Found ${data.count} videos from @${username}!`);
        } else {
          toast.warning(`⚠️ No videos found for @${username}. The profile might be private or have no posts.`);
        }
      } else {
        console.error('❌ API Error:', data.error);
        toast.error(data.error || 'Failed to fetch content');
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      toast.error('Error fetching content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = async (post: TikTokPost) => {
    try {
      // Create FormData to match the API expectation
      const formData = new FormData();
      formData.append('videoUrl', `https://www.tiktok.com/@${post.username}/video/${post.id}`);
      formData.append('title', post.title);
      formData.append('views', post.views?.toString() || '0');
      formData.append('duration', '0:00');
      formData.append('isPlayable', 'true');
      
      // If there's a thumbnail, add it as a base64 data URL
      if (post.thumbnail) {
        // Convert thumbnail URL to base64 if it's a TikTok CDN URL
        try {
          const imageResponse = await fetch(post.thumbnail);
          const imageBlob = await imageResponse.blob();
          formData.append('image', imageBlob, 'thumbnail.jpg');
        } catch (imageError) {
          console.warn('Could not fetch thumbnail:', imageError);
        }
      }

      const response = await fetch('/api/admin/tiktok', {
        method: 'POST',
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });

      if (response.ok) {
        toast.success('Post saved to database');
        // Remove from extracted posts
        setExtractedPosts(prev => prev.filter(p => p.id !== post.id));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Error saving post');
    }
  };

  const testThumbnailUrl = async (url: string) => {
    setTestingThumbnail(url);
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`🔍 Thumbnail test for ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        toast.success('Thumbnail URL is accessible');
      } else {
        toast.error(`Thumbnail URL failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Thumbnail test error:', error);
      toast.error('Thumbnail URL is not accessible (CORS or network error)');
    } finally {
      setTestingThumbnail(null);
    }
  };

  const debugSpecificVideo = (videoId: string) => {
    console.log(`🔍 Debugging video ID: ${videoId}`);
    console.log(`📄 HTML content length: ${htmlContent.length}`);
    
    // Search for the specific video ID in the HTML
    const videoIdRegex = new RegExp(videoId, 'g');
    const matches = htmlContent.match(videoIdRegex);
    console.log(`🎯 Found ${matches ? matches.length : 0} occurrences of video ID ${videoId} in HTML`);
    
    // Search for images near this video ID
    const lines = htmlContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes(videoId)) {
        console.log(`📍 Line ${index + 1} contains video ID:`, line.substring(0, 200));
      }
    });
    
    // Search for TikTok CDN images
    const tiktokImages = htmlContent.match(/src="[^"]*tiktokcdn[^"]*"/g);
    console.log(`🖼️ Found ${tiktokImages ? tiktokImages.length : 0} TikTok CDN images in HTML`);
    
    if (tiktokImages) {
      tiktokImages.forEach((img, index) => {
        console.log(`🖼️ Image ${index + 1}: ${img}`);
      });
    }
    
    toast.info(`Debug info logged to console for video ID: ${videoId}`);
  };

  const handleSaveAll = async () => {
    if (extractedPosts.length === 0) {
      toast.error('No posts to save');
      return;
    }

    setSavingAll(true);
    let savedCount = 0;
    let errorCount = 0;

    try {
      for (const post of extractedPosts) {
        try {
          // Create FormData to match the API expectation
          const formData = new FormData();
          formData.append('videoUrl', `https://www.tiktok.com/@${post.username}/video/${post.id}`);
          formData.append('title', post.title);
          formData.append('views', post.views?.toString() || '0');
          formData.append('duration', '0:00');
          formData.append('isPlayable', 'true');
          
          // If there's a thumbnail, add it as a base64 data URL
          if (post.thumbnail) {
            try {
              const imageResponse = await fetch(post.thumbnail);
              const imageBlob = await imageResponse.blob();
              formData.append('image', imageBlob, 'thumbnail.jpg');
            } catch (imageError) {
              console.warn('Could not fetch thumbnail:', imageError);
            }
          }

          const response = await fetch('/api/admin/tiktok', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            savedCount++;
            // Remove from extracted posts
            setExtractedPosts(prev => prev.filter(p => p.id !== post.id));
          } else {
            errorCount++;
            console.error(`Failed to save post ${post.id}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error saving post ${post.id}:`, error);
        }
        
        // Add small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (savedCount > 0) {
        toast.success(`✅ Saved ${savedCount} posts to database`);
      }
      if (errorCount > 0) {
        toast.error(`❌ Failed to save ${errorCount} posts`);
      }
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Download className="h-5 w-5" />
            TikTok Content Fetcher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="username" className="text-sm font-medium">TikTok Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="queens_meal"
              className="text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="htmlContent" className="text-sm font-medium">Paste HTML Content</Label>
            <Textarea
              id="htmlContent"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Paste the HTML content from TikTok page here..."
              rows={6}
              className="font-mono text-xs sm:text-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleFetchFromUsername} disabled={loading} className="h-10 sm:h-11">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm sm:text-base">Fetching...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="text-sm sm:text-base">Fetch from @{username}</span>
                </>
              )}
            </Button>
            
            <Button onClick={handleExtract} disabled={loading} variant="outline" className="h-10 sm:h-11">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm sm:text-base">Extracting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="text-sm sm:text-base">Extract from HTML</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {extractedPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <span className="text-lg sm:text-xl">✅ Found {extractedPosts.length} Posts</span>
              <Button onClick={handleSaveAll} variant="outline" disabled={savingAll} className="w-full sm:w-auto h-10 sm:h-11">
                {savingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="text-sm sm:text-base">Saving...</span>
                  </>
                ) : (
                  <span className="text-sm sm:text-base">Save All to Database</span>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4">
              {extractedPosts.map((post) => (
                <div key={post.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg">
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(`❌ Failed to load thumbnail for post ${post.id}:`, post.thumbnail);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold ${post.thumbnail ? 'hidden' : ''}`}>
                      <Video className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 w-full sm:w-auto">
                    <h4 className="font-medium text-sm sm:text-base break-words">{post.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">@{post.username}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                      <p className="text-xs text-gray-400">ID: {post.id}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-blue-500"
                        onClick={() => debugSpecificVideo(post.id)}
                      >
                        Debug
                      </Button>
                    </div>
                    {post.thumbnail && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                        <p className="text-xs text-green-500 break-all">🖼️ Thumbnail: {post.thumbnail.substring(0, 30)}...</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => testThumbnailUrl(post.thumbnail)}
                          disabled={testingThumbnail === post.thumbnail}
                        >
                          {testingThumbnail === post.thumbnail ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Test'
                          )}
                        </Button>
                      </div>
                    )}
                    {!post.thumbnail && (
                      <p className="text-xs text-orange-500">⚠️ No thumbnail available</p>
                    )}
                    {post.views && post.views > 0 && (
                      <p className="text-xs text-blue-500">👀 {post.views.toLocaleString()} views</p>
                    )}
                    {post.likes && post.likes > 0 && (
                      <p className="text-xs text-red-500">❤️ {post.likes.toLocaleString()} likes</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSaveToDatabase(post)}
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto h-8 sm:h-9"
                  >
                    <span className="text-xs sm:text-sm">Save</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}