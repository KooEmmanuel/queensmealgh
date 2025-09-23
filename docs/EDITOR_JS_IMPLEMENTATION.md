# Editor.js Implementation Documentation

## Overview

This document provides comprehensive documentation for the Editor.js implementation in the Queensmeal platform. The implementation includes robust error handling, data validation, secure image uploads, and production-ready features.

## Architecture

### Core Components

1. **Editor Component** (`components/ui/editor-js.tsx`)
   - Main Editor.js wrapper with React integration
   - Comprehensive error handling and validation
   - Custom image upload with server-side processing
   - Auto-save functionality with debouncing

2. **Data Storage Utilities** (`lib/editorDataStorage.ts`)
   - Data validation and sanitization
   - Compression and decompression utilities
   - Backup and restore functionality
   - Auto-save with debouncing

3. **Image Upload API** (`app/api/upload-image/route.ts`)
   - Secure file upload with validation
   - File type and size restrictions
   - Secure filename generation
   - Comprehensive error handling

## Features

### ✅ Implemented Features

#### **Rich Text Editing**
- **Headers** (H1-H6) with inline toolbar
- **Paragraphs** with formatting options
- **Lists** (ordered and unordered)
- **Quotes** with author attribution
- **Code blocks** with syntax highlighting
- **Images** with server-side upload and validation
- **Tables** with inline editing
- **Embeds** (YouTube, Twitter, Instagram, GitHub, CodePen)
- **Warnings** with customizable titles and messages
- **Delimiters** for content separation
- **Inline formatting** (bold, italic, code, markers)

#### **Error Handling**
- **Custom Error Classes**: `EditorInitializationError`, `EditorDataError`, `ImageUploadError`
- **Comprehensive Validation**: Data structure, file types, sizes, and content
- **Graceful Degradation**: Fallback UI for errors with retry functionality
- **Error Reporting**: Detailed logging with context and stack traces
- **User-Friendly Messages**: Clear error messages with actionable guidance

#### **Data Management**
- **Data Validation**: Schema validation for all block types
- **Content Sanitization**: HTML sanitization and XSS prevention
- **Size Limits**: Configurable limits for blocks and total content
- **Auto-save**: Debounced auto-save with conflict resolution
- **Backup System**: Automatic backup creation and restore functionality

#### **Image Handling**
- **Secure Upload**: Server-side validation and processing
- **File Validation**: Type, size, and name validation
- **Secure Naming**: Hash-based filename generation
- **Directory Management**: Automatic directory creation
- **Error Recovery**: Timeout handling and retry mechanisms

### 🔧 Configuration

#### **Editor Configuration**
```typescript
const editorConfig = {
  holder: 'editorjs-container',
  placeholder: 'Let\'s write an awesome story!',
  readOnly: false,
  minHeight: 200,
  maxHeight: 800,
  logLevel: 'WARN' // Development: WARN, Production: ERROR
};
```

#### **Storage Configuration**
```typescript
const storageConfig = {
  maxBlocks: 100,
  maxBlockSize: 10000, // characters
  allowedBlockTypes: [
    'paragraph', 'header', 'list', 'quote', 'image', 
    'code', 'embed', 'table', 'warning', 'delimiter'
  ],
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxTotalSize: 50 * 1024 * 1024 // 50MB
};
```

#### **Upload Configuration**
```typescript
const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  uploadDir: 'public/uploads'
};
```

## Usage Examples

### Basic Editor Implementation

```tsx
import { Editor } from '@/components/ui/editor-js';

function BlogEditor() {
  const [editorData, setEditorData] = useState({
    time: Date.now(),
    blocks: [],
    version: '2.8.1'
  });

  const handleEditorChange = (data: OutputData) => {
    setEditorData(data);
  };

  const handleEditorError = (error: Error) => {
    console.error('Editor error:', error);
    // Handle error (show notification, log to service, etc.)
  };

  return (
    <Editor
      data={editorData}
      onChange={handleEditorChange}
      onError={handleEditorError}
      placeholder="Start writing your blog post..."
      minHeight={300}
    />
  );
}
```

### Advanced Editor with Auto-save

```tsx
import { Editor } from '@/components/ui/editor-js';
import { EditorAutoSave } from '@/lib/editorDataStorage';

function AdvancedBlogEditor() {
  const [editorData, setEditorData] = useState(defaultData);
  const [isSaving, setIsSaving] = useState(false);

  const autoSave = useMemo(() => new EditorAutoSave(async (data) => {
    setIsSaving(true);
    try {
      await saveToServer(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }), []);

  const handleEditorChange = (data: OutputData) => {
    setEditorData(data);
    autoSave.scheduleSave(data, 2000); // 2 second delay
  };

  return (
    <div>
      <Editor
        data={editorData}
        onChange={handleEditorChange}
        onError={handleEditorError}
        placeholder="Start writing..."
      />
      {isSaving && <div>Saving...</div>}
    </div>
  );
}
```

### Data Validation and Sanitization

```tsx
import { validateEditorData, sanitizeEditorData } from '@/lib/editorDataStorage';

function handleSave(data: OutputData) {
  const validation = validateEditorData(data);
  
  if (!validation.isValid) {
    console.error('Validation errors:', validation.errors);
    return;
  }

  if (validation.warnings.length > 0) {
    console.warn('Validation warnings:', validation.warnings);
  }

  const sanitizedData = validation.sanitizedData;
  // Save sanitized data to server
}
```

## Error Handling Patterns

### 1. Initialization Errors

```tsx
const handleEditorError = (error: Error) => {
  if (error instanceof EditorInitializationError) {
    // Handle initialization failure
    showNotification('Failed to load editor. Please refresh the page.');
  } else if (error instanceof EditorDataError) {
    // Handle data corruption
    showNotification('Content data is invalid. Please check your content.');
  }
};
```

### 2. Image Upload Errors

```tsx
const handleImageUpload = async (file: File) => {
  try {
    const result = await uploadImage(file);
    return { success: 1, file: result };
  } catch (error) {
    if (error instanceof ImageUploadError) {
      showNotification(`Upload failed: ${error.message}`);
    }
    return { success: 0, error: error.message };
  }
};
```

### 3. Data Validation Errors

```tsx
const validateContent = (data: OutputData) => {
  const validation = validateEditorData(data);
  
  if (!validation.isValid) {
    const errorMessage = validation.errors.join(', ');
    throw new EditorDataError(`Content validation failed: ${errorMessage}`);
  }
  
  return validation.sanitizedData;
};
```

## Security Considerations

### 1. Content Sanitization
- HTML sanitization to prevent XSS attacks
- Script tag removal
- Iframe content filtering
- JavaScript event handler removal

### 2. File Upload Security
- File type validation (MIME type and extension)
- File size limits
- Secure filename generation
- Directory traversal prevention

### 3. Data Validation
- Schema validation for all block types
- Content length limits
- Malformed data handling
- Input sanitization

## Performance Optimizations

### 1. Lazy Loading
- Editor.js loads only when needed
- Dynamic imports for heavy tools
- Conditional tool loading

### 2. Debounced Auto-save
- 2-second delay to prevent excessive saves
- Conflict resolution for concurrent edits
- Background saving with user feedback

### 3. Memory Management
- Proper cleanup on component unmount
- Event listener removal
- Memory leak prevention

## Best Practices

### 1. Error Handling
- Always wrap Editor.js initialization in try-catch
- Provide fallback UI for errors
- Log errors with sufficient context
- Use custom error classes for better debugging

### 2. Data Management
- Validate data before saving
- Implement auto-save with debouncing
- Create backups before major changes
- Handle data corruption gracefully

### 3. User Experience
- Show loading states during initialization
- Provide clear error messages
- Implement retry mechanisms
- Maintain editor state across re-renders

### 4. Security
- Sanitize all user input
- Validate file uploads thoroughly
- Use secure filename generation
- Implement proper access controls

## Troubleshooting

### Common Issues

#### 1. Editor Not Loading
- Check if holder element exists
- Verify Editor.js dependencies
- Check browser console for errors
- Ensure proper initialization sequence

#### 2. Image Upload Failures
- Verify file type and size
- Check server permissions
- Validate upload directory exists
- Check network connectivity

#### 3. Data Corruption
- Validate data structure
- Check for malformed blocks
- Implement data recovery
- Use backup systems

#### 4. Performance Issues
- Optimize image sizes
- Implement lazy loading
- Use debounced auto-save
- Monitor memory usage

### Debug Mode

Enable debug mode for development:

```typescript
const editor = new EditorJS({
  // ... other config
  logLevel: LogLevels.DEBUG, // Enable debug logging
  onReady: () => console.log('Editor ready'),
  onChange: (api) => console.log('Editor changed')
});
```

## API Reference

### Editor Component Props

```typescript
interface EditorProps {
  data: OutputData;                    // Editor content data
  onChange: (data: OutputData) => void; // Change handler
  holder?: string;                     // DOM element ID
  placeholder?: string;                // Placeholder text
  readOnly?: boolean;                  // Read-only mode
  onError?: (error: Error) => void;   // Error handler
  onReady?: () => void;                // Ready callback
  minHeight?: number;                  // Minimum height
  maxHeight?: number;                  // Maximum height
}
```

### Data Storage Utilities

```typescript
// Validate editor data
validateEditorData(data: any, config?: EditorStorageConfig): EditorDataValidationResult

// Compress data for storage
compressEditorData(data: OutputData): string

// Decompress data from storage
decompressEditorData(compressedData: string): OutputData

// Create data backup
createDataBackup(data: OutputData): BackupData

// Restore from backup
restoreDataBackup(backup: BackupData): OutputData
```

### Auto-save Class

```typescript
class EditorAutoSave {
  constructor(saveCallback: (data: OutputData) => Promise<void>);
  scheduleSave(data: OutputData, delay?: number): void;
  cancelPendingSave(): void;
}
```

## Conclusion

This Editor.js implementation provides a robust, secure, and user-friendly rich text editing experience. The comprehensive error handling, data validation, and security measures ensure a production-ready solution for content creation.

For additional support or questions, refer to the [Editor.js documentation](https://editorjs.io/) or contact the development team.