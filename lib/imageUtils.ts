/**
 * Utility functions for image processing and conversion
 */

/**
 * Converts an image URL to base64 data URL
 * @param imageUrl - The URL of the image to convert
 * @returns Promise<string> - The base64 data URL
 */
export async function convertImageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    // Validate the image URL
    if (!imageUrl || !imageUrl.startsWith('http')) {
      throw new Error('Invalid image URL');
    }

    // Fetch the image with CORS support
    const response = await fetch(imageUrl, {
      mode: 'cors',
      headers: {
        'Accept': 'image/*',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Validate blob type
    if (!blob.type.startsWith('image/')) {
      throw new Error(`Invalid image format: ${blob.type}`);
    }
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        if (!result.startsWith('data:image/')) {
          reject(new Error('Failed to convert image to base64'));
        } else {
          resolve(result);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image data'));
      };
      
      reader.readAsDataURL(blob);
    });
    
  } catch (error) {
    console.error('Error converting image URL to base64:', error);
    throw error;
  }
}

/**
 * Validates if a string is a valid base64 image data URL
 * @param base64 - The base64 string to validate
 * @returns boolean - True if valid, false otherwise
 */
export function isValidBase64Image(base64: string): boolean {
  if (!base64 || typeof base64 !== 'string') {
    return false;
  }
  
  // Check if it starts with data:image/
  if (!base64.startsWith('data:image/')) {
    return false;
  }
  
  // Check if it's long enough to be a real image
  if (base64.length < 100) {
    return false;
  }
  
  return true;
}

/**
 * Gets the image format from a base64 data URL
 * @param base64 - The base64 data URL
 * @returns string - The image format (e.g., 'jpeg', 'png', 'webp')
 */
export function getImageFormat(base64: string): string {
  if (!base64.startsWith('data:image/')) {
    return 'unknown';
  }
  
  const match = base64.match(/data:image\/([^;]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Gets the approximate file size of a base64 string
 * @param base64 - The base64 string
 * @returns number - The approximate size in bytes
 */
export function getBase64Size(base64: string): number {
  if (!base64) return 0;
  
  // Remove the data URL prefix to get just the base64 data
  const base64Data = base64.split(',')[1];
  if (!base64Data) return 0;
  
  // Base64 encoding increases size by ~33%, so we need to account for that
  return Math.round((base64Data.length * 3) / 4);
}