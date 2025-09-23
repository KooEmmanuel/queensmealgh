import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createHash } from 'crypto';

// Enhanced error classes
class ImageUploadError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

// Configuration
const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  uploadDir: 'public/uploads'
};

// Validation functions
function validateFileType(file: File): void {
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    throw new ImageUploadError(
      `Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`,
      400
    );
  }
}

function validateFileSize(file: File): void {
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    throw new ImageUploadError(
      `File size exceeds limit. Maximum allowed: ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`,
      400
    );
  }
}

function validateFileName(fileName: string): void {
  if (!fileName || fileName.length > 255) {
    throw new ImageUploadError('Invalid file name', 400);
  }
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension || !UPLOAD_CONFIG.allowedExtensions.includes(`.${extension}`)) {
    throw new ImageUploadError(
      `Invalid file extension. Allowed: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`,
      400
    );
  }
}

function generateSecureFilename(originalName: string): string {
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const hash = createHash('sha256').update(Math.random().toString()).digest('hex').substring(0, 16);
  const timestamp = Date.now();
  return `${hash}-${timestamp}.${extension}`;
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }
  } catch (error: any) {
    throw new ImageUploadError(`Failed to create upload directory: ${error.message}`, 500);
  }
}

async function saveFile(buffer: Buffer, filePath: string): Promise<void> {
  try {
    await writeFile(filePath, buffer);
  } catch (error: any) {
    throw new ImageUploadError(`Failed to save file: ${error.message}`, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const type = formData.get('type') as string || 'general';

    // Validate required fields
    if (!file) {
      throw new ImageUploadError('No image file provided', 400);
    }

    if (!type || typeof type !== 'string') {
      throw new ImageUploadError('Upload type is required', 400);
    }

    // Validate file
    validateFileType(file);
    validateFileSize(file);
    validateFileName(file.name);

    // Generate secure filename
    const secureFilename = generateSecureFilename(file.name);
    
    // Determine upload directory
    const uploadsDir = join(process.cwd(), UPLOAD_CONFIG.uploadDir, type);
    await ensureDirectoryExists(uploadsDir);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save file
    const filePath = join(uploadsDir, secureFilename);
    await saveFile(buffer, filePath);

    // Generate public URL
    const url = `/uploads/${type}/${secureFilename}`;

    // Log successful upload
    console.log(`Image uploaded successfully: ${url}`, {
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadType: type,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: 1,
      file: {
        url: url,
        name: secureFilename,
        size: file.size,
        type: file.type
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Image upload error:', error);
    
    if (error instanceof ImageUploadError) {
      return NextResponse.json({ 
        success: 0, 
        error: error.message 
      }, { status: error.statusCode });
    }

    // Handle unexpected errors
    return NextResponse.json({ 
      success: 0, 
      error: 'Internal server error during image upload' 
    }, { status: 500 });
  }
}