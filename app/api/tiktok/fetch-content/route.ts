import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching TikTok profile for @${username}`);
    
    // TikTok profile URL
    const profileUrl = `https://www.tiktok.com/@${username}`;
    console.log(`📡 Requesting: ${profileUrl}`);
    
    try {
      // Fetch the TikTok profile page
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const html = await response.text();
      console.log(`📄 Received HTML (${html.length} characters)`);
      
      // Extract video data from the HTML
      const videos = extractVideoData(html, username);
      console.log(`🎬 Extracted ${videos.length} videos:`, videos.map(v => ({ id: v.id, title: v.title })));
      
      return NextResponse.json({
        success: true,
        username,
        videos,
        count: videos.length,
        message: `Successfully fetched ${videos.length} videos from @${username}`
      });

    } catch (fetchError) {
      console.error('Error fetching TikTok profile:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch TikTok profile',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in fetch-content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractVideoData(html: string, username: string) {
  const videos: any[] = [];
  
  try {
    console.log(`🔍 Extracting video data for @${username}`);
    
    // Look for video data in script tags (TikTok often embeds data in JSON)
    const scriptRegex = /<script[^>]*>window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/; 
    const match = html.match(scriptRegex);
    
    if (match) {
      console.log(`📊 Found JSON data in script tag`);
      try {
        const data = JSON.parse(match[1]);
        console.log(`📋 Parsed JSON data keys:`, Object.keys(data));
        
        // Extract video information from the parsed data
        if (data?.ItemModule) {
          console.log(`🎬 Found ItemModule with ${Object.keys(data.ItemModule).length} items`);
          Object.values(data.ItemModule).forEach((item: any) => {
            if (item.video) {
              const video = {
                id: item.id,
                title: item.desc || `Video by @${username}`,
                thumbnail: item.video.cover || item.video.dynamicCover,
                videoUrl: `https://www.tiktok.com/@${username}/video/${item.id}`,
                views: item.stats?.playCount || 0,
                likes: item.stats?.diggCount || 0,
                comments: item.stats?.commentCount || 0,
                createdAt: new Date(item.createTime * 1000).toISOString(),
                username: username
              };
              videos.push(video);
              console.log(`✅ Added video: ${video.id} - ${video.title}`);
            }
          });
        } else {
          console.log(`⚠️ No ItemModule found in JSON data`);
        }
      } catch (parseError) {
        console.error('❌ Error parsing TikTok JSON data:', parseError);
      }
    } else {
      console.log(`⚠️ No JSON data found in script tags`);
    }
    
    // If we found videos but some don't have thumbnails, try to extract them from HTML
    if (videos.length > 0) {
      const videosWithoutThumbnails = videos.filter(v => !v.thumbnail);
      if (videosWithoutThumbnails.length > 0) {
        console.log(`🖼️ Trying to extract thumbnails for ${videosWithoutThumbnails.length} videos without thumbnails`);
        
        const thumbnailRegex = /src="([^"]*tiktokcdn[^"]*)"/g;
        let thumbMatch;
        let thumbIndex = 0;
        
        while ((thumbMatch = thumbnailRegex.exec(html)) !== null && thumbIndex < videosWithoutThumbnails.length) {
          videosWithoutThumbnails[thumbIndex].thumbnail = thumbMatch[1];
          console.log(`🖼️ Added thumbnail to video ${videosWithoutThumbnails[thumbIndex].id}: ${thumbMatch[1].substring(0, 50)}...`);
          thumbIndex++;
        }
        
        // Log final thumbnail status
        videos.forEach(video => {
          if (video.thumbnail) {
            console.log(`✅ Video ${video.id} has thumbnail: ${video.thumbnail.substring(0, 50)}...`);
          } else {
            console.log(`❌ Video ${video.id} has no thumbnail`);
          }
        });
      }
    }
    
    // Fallback: Extract from HTML structure if JSON parsing fails
    if (videos.length === 0) {
      console.log(`🔄 Trying fallback HTML extraction...`);
      
      // Look for video links in the HTML
      const videoLinkRegex = /href="\/@[^"]+\/video\/(\d+)"/g;
      let match;
      let index = 0;
      
      while ((match = videoLinkRegex.exec(html)) !== null && index < 10) {
        const videoId = match[1];
        
        // Try to find thumbnail for this video ID
        let thumbnail = '';
        const thumbnailRegex = new RegExp(`src="([^"]*tiktokcdn[^"]*)"[^>]*alt="[^"]*${videoId}[^"]*"`, 'i');
        const thumbnailMatch = html.match(thumbnailRegex);
        if (thumbnailMatch) {
          thumbnail = thumbnailMatch[1];
          console.log(`🖼️ Found thumbnail for video ${videoId}: ${thumbnail}`);
        } else {
          // Try alternative pattern - look for any TikTok CDN image near the video link
          const altThumbnailRegex = new RegExp(`src="([^"]*tiktokcdn[^"]*)"`, 'g');
          let thumbMatch;
          let thumbIndex = 0;
          while ((thumbMatch = altThumbnailRegex.exec(html)) !== null && thumbIndex < 20) {
            if (thumbIndex === index) { // Match by position
              thumbnail = thumbMatch[1];
              console.log(`🖼️ Found thumbnail by position for video ${videoId}: ${thumbnail}`);
              break;
            }
            thumbIndex++;
          }
        }
        
        // Try to extract title from alt text if available
        let title = `Video by @${username}`;
        const altTextRegex = new RegExp(`alt="([^"]*)"[^>]*src="[^"]*${videoId}[^"]*"`);
        const altMatch = html.match(altTextRegex);
        if (altMatch && altMatch[1]) {
          // Clean up the title - remove hashtags, "created by" text, and extra whitespace
          title = altMatch[1]
            .replace(/created by.*$/i, '')
            .replace(/#\w+/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          // If title is too long, truncate it
          if (title.length > 100) {
            title = title.substring(0, 97) + '...';
          }
          
          // If title is empty after cleaning, use default
          if (!title) {
            title = `Video by @${username}`;
          }
          
          console.log(`📝 Extracted title for video ${videoId}: ${title}`);
        }

        const video = {
          id: videoId,
          title: title,
          thumbnail: thumbnail,
          videoUrl: `https://www.tiktok.com/@${username}/video/${videoId}`,
          views: 0,
          likes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
          username: username
        };
        videos.push(video);
        console.log(`✅ Added video from HTML: ${video.id} with thumbnail: ${thumbnail ? 'Yes' : 'No'}`);
        index++;
      }
      
      console.log(`📊 Fallback extraction found ${videos.length} videos`);
    }
    
  } catch (error) {
    console.error('Error extracting video data:', error);
  }
  
  return videos;
}