/**
 * Editor.js Data Storage Utilities
 * Comprehensive data validation, sanitization, and storage management
 */

import { OutputData } from '@editorjs/editorjs';

// Data validation schemas
export interface EditorDataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: OutputData;
}

// Storage configuration
export interface EditorStorageConfig {
  maxBlocks: number;
  maxBlockSize: number; // in characters
  allowedBlockTypes: string[];
  maxImageSize: number; // in bytes
  maxTotalSize: number; // in bytes
}

// Default configuration
export const DEFAULT_STORAGE_CONFIG: EditorStorageConfig = {
  maxBlocks: 100,
  maxBlockSize: 10000,
  allowedBlockTypes: [
    'paragraph', 'header', 'list', 'quote', 'image', 'code', 
    'embed', 'table', 'warning', 'checklist', 'delimiter', 'raw'
  ],
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxTotalSize: 50 * 1024 * 1024, // 50MB
};

/**
 * Validates Editor.js data structure and content
 */
export function validateEditorData(
  data: any, 
  config: EditorStorageConfig = DEFAULT_STORAGE_CONFIG
): EditorDataValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic structure validation
  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { isValid: false, errors, warnings };
  }

  if (!Array.isArray(data.blocks)) {
    errors.push('Data must contain a blocks array');
    return { isValid: false, errors, warnings };
  }

  if (data.blocks.length > config.maxBlocks) {
    errors.push(`Too many blocks. Maximum allowed: ${config.maxBlocks}`);
  }

  // Validate each block
  const sanitizedBlocks: any[] = [];
  let totalSize = 0;

  for (let i = 0; i < data.blocks.length; i++) {
    const block = data.blocks[i];
    
    if (!block || typeof block !== 'object') {
      errors.push(`Block ${i} is invalid`);
      continue;
    }

    if (!block.type || typeof block.type !== 'string') {
      errors.push(`Block ${i} missing or invalid type`);
      continue;
    }

    if (!config.allowedBlockTypes.includes(block.type)) {
      errors.push(`Block ${i} has disallowed type: ${block.type}`);
      continue;
    }

    if (!block.data || typeof block.data !== 'object') {
      errors.push(`Block ${i} missing or invalid data`);
      continue;
    }

    // Validate block content size
    const blockSize = JSON.stringify(block).length;
    if (blockSize > config.maxBlockSize) {
      errors.push(`Block ${i} exceeds maximum size of ${config.maxBlockSize} characters`);
      continue;
    }

    totalSize += blockSize;

    // Sanitize block data
    const sanitizedBlock = sanitizeBlock(block);
    sanitizedBlocks.push(sanitizedBlock);
  }

  if (totalSize > config.maxTotalSize) {
    errors.push(`Total content size exceeds maximum of ${config.maxTotalSize} bytes`);
  }

  // Check for required fields
  if (!data.time || typeof data.time !== 'number') {
    warnings.push('Missing or invalid timestamp');
  }

  if (!data.version || typeof data.version !== 'string') {
    warnings.push('Missing or invalid version');
  }

  const sanitizedData: OutputData = {
    time: data.time || Date.now(),
    blocks: sanitizedBlocks,
    version: data.version || '2.8.1'
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
}

/**
 * Sanitizes individual block data
 */
function sanitizeBlock(block: any): any {
  const sanitized = {
    type: block.type,
    data: { ...block.data },
    id: block.id || generateBlockId()
  };

  // Sanitize based on block type
  switch (block.type) {
    case 'header':
      if (sanitized.data.text) {
        sanitized.data.text = sanitizeHtml(sanitized.data.text);
      }
      if (sanitized.data.level && (sanitized.data.level < 1 || sanitized.data.level > 6)) {
        sanitized.data.level = 2; // Default to H2
      }
      break;

    case 'paragraph':
      if (sanitized.data.text) {
        sanitized.data.text = sanitizeHtml(sanitized.data.text);
      }
      break;

    case 'list':
      if (Array.isArray(sanitized.data.items)) {
        sanitized.data.items = sanitized.data.items.map((item: any) => {
          if (typeof item === 'string') {
            return sanitizeHtml(item);
          }
          if (typeof item === 'object' && item.text) {
            return { ...item, text: sanitizeHtml(item.text) };
          }
          return item;
        });
      }
      break;

    case 'quote':
      if (sanitized.data.text) {
        sanitized.data.text = sanitizeHtml(sanitized.data.text);
      }
      if (sanitized.data.caption) {
        sanitized.data.caption = sanitizeHtml(sanitized.data.caption);
      }
      break;

    case 'image':
      // Validate image URL
      if (sanitized.data.file && sanitized.data.file.url) {
        if (!isValidUrl(sanitized.data.file.url)) {
          delete sanitized.data.file;
        }
      }
      if (sanitized.data.caption) {
        sanitized.data.caption = sanitizeHtml(sanitized.data.caption);
      }
      break;

    case 'code':
      if (sanitized.data.code) {
        // Don't sanitize code content, but ensure it's a string
        sanitized.data.code = String(sanitized.data.code);
      }
      break;

    case 'table':
      if (Array.isArray(sanitized.data.content)) {
        sanitized.data.content = sanitized.data.content.map((row: any[]) => 
          row.map(cell => sanitizeHtml(String(cell)))
        );
      }
      break;

    case 'warning':
      if (sanitized.data.title) {
        sanitized.data.title = sanitizeHtml(sanitized.data.title);
      }
      if (sanitized.data.message) {
        sanitized.data.message = sanitizeHtml(sanitized.data.message);
      }
      break;

    case 'checklist':
      if (Array.isArray(sanitized.data.items)) {
        sanitized.data.items = sanitized.data.items.map((item: any) => ({
          text: sanitizeHtml(item.text || ''),
          checked: Boolean(item.checked)
        }));
      }
      break;

    case 'raw':
      if (sanitized.data.html) {
        sanitized.data.html = sanitizeHtml(sanitized.data.html);
      }
      break;
  }

  return sanitized;
}

/**
 * Basic HTML sanitization
 */
function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  
  // Remove potentially dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates unique block ID
 */
function generateBlockId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Compresses Editor.js data for storage
 */
export function compressEditorData(data: OutputData): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    throw new Error(`Failed to compress editor data: ${error}`);
  }
}

/**
 * Decompresses Editor.js data from storage
 */
export function decompressEditorData(compressedData: string): OutputData {
  try {
    const data = JSON.parse(compressedData);
    const validation = validateEditorData(data);
    
    if (!validation.isValid) {
      throw new Error(`Invalid editor data: ${validation.errors.join(', ')}`);
    }
    
    return validation.sanitizedData!;
  } catch (error) {
    throw new Error(`Failed to decompress editor data: ${error}`);
  }
}

/**
 * Calculates data size in bytes
 */
export function calculateDataSize(data: OutputData): number {
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * Creates a backup of editor data
 */
export function createDataBackup(data: OutputData): {
  backup: OutputData;
  timestamp: number;
  size: number;
} {
  return {
    backup: JSON.parse(JSON.stringify(data)), // Deep clone
    timestamp: Date.now(),
    size: calculateDataSize(data)
  };
}

/**
 * Restores editor data from backup
 */
export function restoreDataBackup(backup: any): OutputData {
  if (!backup || !backup.backup) {
    throw new Error('Invalid backup data');
  }
  
  const validation = validateEditorData(backup.backup);
  if (!validation.isValid) {
    throw new Error(`Invalid backup data: ${validation.errors.join(', ')}`);
  }
  
  return validation.sanitizedData!;
}

/**
 * Auto-save functionality with debouncing
 */
export class EditorAutoSave {
  private timeoutId: NodeJS.Timeout | null = null;
  private lastSavedData: string = '';
  private saveCallback: (data: OutputData) => Promise<void>;

  constructor(saveCallback: (data: OutputData) => Promise<void>) {
    this.saveCallback = saveCallback;
  }

  public scheduleSave(data: OutputData, delay: number = 2000): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const dataString = JSON.stringify(data);
    if (dataString === this.lastSavedData) {
      return; // No changes to save
    }

    this.timeoutId = setTimeout(async () => {
      try {
        await this.saveCallback(data);
        this.lastSavedData = dataString;
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay);
  }

  public cancelPendingSave(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}