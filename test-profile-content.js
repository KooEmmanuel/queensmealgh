const https = require('https');
const http = require('http');

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Function to analyze profile content
function analyzeProfileContent(html) {
  console.log(`📄 HTML Content Analysis:`);
  console.log(`- Total length: ${html.length} characters`);
  
  // Look for any video IDs in the HTML
  const videoIdRegex = /\/video\/(\d+)/g;
  const videoMatches = [...html.matchAll(videoIdRegex)];
  console.log(`🎬 Found ${videoMatches.length} video IDs in HTML:`);
  
  videoMatches.forEach((match, index) => {
    console.log(`  ${index + 1}. ${match[1]}`);
  });
  
  // Look for TikTok CDN images
  const tiktokImages = html.match(/src="[^"]*tiktokcdn[^"]*"/g);
  console.log(`\n🖼️ Found ${tiktokImages ? tiktokImages.length : 0} TikTok CDN images:`);
  
  if (tiktokImages) {
    tiktokImages.forEach((img, index) => {
      const src = img.match(/src="([^"]*)"/)[1];
      console.log(`  ${index + 1}. ${src.substring(0, 100)}...`);
    });
  }
  
  // Look for any image sources
  const allImages = html.match(/src="[^"]*\.(jpg|jpeg|png|webp|avif)[^"]*"/gi);
  console.log(`\n📸 Found ${allImages ? allImages.length : 0} image sources:`);
  
  if (allImages) {
    allImages.slice(0, 10).forEach((img, index) => {
      const src = img.match(/src="([^"]*)"/)[1];
      console.log(`  ${index + 1}. ${src.substring(0, 80)}...`);
    });
    if (allImages.length > 10) {
      console.log(`  ... and ${allImages.length - 10} more`);
    }
  }
  
  // Look for script tags with data
  const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/g);
  console.log(`\n📜 Found ${scriptTags ? scriptTags.length : 0} script tags`);
  
  if (scriptTags) {
    scriptTags.forEach((script, index) => {
      if (script.includes('__INITIAL_STATE__') || script.includes('window.') || script.includes('JSON')) {
        console.log(`  ${index + 1}. Data script (${script.length} chars): ${script.substring(0, 100)}...`);
      }
    });
  }
  
  // Look for specific patterns
  const patterns = {
    'tiktok.com': (html.match(/tiktok\.com/g) || []).length,
    'video/': (html.match(/\/video\//g) || []).length,
    'tiktokcdn': (html.match(/tiktokcdn/g) || []).length,
    'alt=': (html.match(/alt=/g) || []).length,
    'img src=': (html.match(/<img[^>]*src=/g) || []).length
  };
  
  console.log(`\n🔍 Pattern Analysis:`);
  Object.entries(patterns).forEach(([pattern, count]) => {
    console.log(`  - ${pattern}: ${count} occurrences`);
  });
  
  return {
    videoIds: videoMatches.map(m => m[1]),
    tiktokImages: tiktokImages || [],
    allImages: allImages || [],
    patterns
  };
}

// Main function
async function main() {
  const username = 'queens_meal';
  const profileUrl = `https://www.tiktok.com/@${username}`;
  
  console.log(`🚀 Analyzing TikTok profile: @${username}`);
  console.log(`📡 Fetching: ${profileUrl}`);
  
  try {
    // Fetch the TikTok profile page
    const response = await makeRequest(profileUrl);
    
    if (response.statusCode !== 200) {
      console.error(`❌ Failed to fetch profile: ${response.statusCode}`);
      return;
    }
    
    console.log(`✅ Successfully fetched profile page`);
    
    // Analyze the content
    const analysis = analyzeProfileContent(response.body);
    
    console.log(`\n📊 Summary:`);
    console.log(`- Available video IDs: ${analysis.videoIds.length}`);
    console.log(`- TikTok CDN images: ${analysis.tiktokImages.length}`);
    console.log(`- Total images: ${analysis.allImages.length}`);
    
    if (analysis.videoIds.length > 0) {
      console.log(`\n🎯 Available videos:`);
      analysis.videoIds.slice(0, 5).forEach((id, index) => {
        console.log(`  ${index + 1}. ${id}`);
      });
      if (analysis.videoIds.length > 5) {
        console.log(`  ... and ${analysis.videoIds.length - 5} more`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Run the test
main().catch(console.error);