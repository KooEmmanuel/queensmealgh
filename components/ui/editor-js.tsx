'use client';

import React, { useEffect, useRef, memo, useCallback, useState, useMemo } from 'react';
import EditorJS, { OutputData, EditorConfig } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import ImageTool from '@editorjs/image';
import CodeTool from '@editorjs/code';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Delimiter from '@editorjs/delimiter';
import Warning from '@editorjs/warning';
import LinkTool from '@editorjs/link';
// import Checklist from '@editorjs/checklist';
// import Raw from '@editorjs/raw';
import { useToast } from '@/components/ui/use-toast';

// Custom error classes for better error handling
class EditorInitializationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'EditorInitializationError';
  }
}

class EditorDataError extends Error {
  constructor(message: string, public data?: any) {
    super(message);
    this.name = 'EditorDataError';
  }
}

class ImageUploadError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

interface EditorProps {
  data: OutputData;
  onChange: (data: OutputData) => void;
  holder?: string;
  placeholder?: string;
  readOnly?: boolean;
  onError?: (error: Error) => void;
  onReady?: () => void;
  minHeight?: number;
  maxHeight?: number;
}

// Data validation utilities
const validateEditorData = (data: any): data is OutputData => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  if (!Array.isArray(data.blocks)) {
    return false;
  }
  
  // Validate each block has required properties
  return data.blocks.every((block: any) => 
    block && 
    typeof block === 'object' && 
    typeof block.type === 'string' && 
    typeof block.data === 'object'
  );
};

// Error reporting utility
const reportError = (error: Error, context: string, additionalData?: any) => {
  console.error(`[EditorJS Error] ${context}:`, {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    additionalData,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: { context, additionalData } });
  }
};

export const Editor = memo(({
  data,
  onChange,
  holder = 'editorjs-container',
  placeholder = 'Let`s write an awesome story!',
  readOnly = false,
  onError,
  onReady,
  minHeight = 200,
  maxHeight = 800,
}: EditorProps) => {
  const editorInstanceRef = useRef<EditorJS | null>(null);
  const isReadyRef = useRef(false);
  const holderIdRef = useRef(holder || 'editorjs-container');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  // Validate initial data
  const validatedData = useMemo(() => {
    if (!validateEditorData(data)) {
      console.warn('Invalid Editor.js data provided, using default structure');
      return {
        time: Date.now(),
        blocks: [],
        version: '2.8.1'
      };
    }
    return data;
  }, [data]);

  // Enhanced image upload handler with comprehensive error handling
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new ImageUploadError('Please select a valid image file (PNG, JPG, GIF, WebP)');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new ImageUploadError('Image size must be less than 5MB');
      }

      // Validate file name
      if (!file.name || file.name.length > 255) {
        throw new ImageUploadError('Invalid file name');
      }

      // Create FormData for server upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'blog-content');

      // Upload to server with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new ImageUploadError(
            `Upload failed: ${response.status} ${response.statusText}`,
            response.status
          );
        }

        const result = await response.json();
        
        if (!result.success || !result.url) {
          throw new ImageUploadError('Invalid response from server');
        }
        
        return {
          success: 1,
          file: {
            url: result.url,
            name: file.name,
            size: file.size,
          }
        };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError instanceof ImageUploadError) {
          throw fetchError;
        }
        if (fetchError.name === 'AbortError') {
          throw new ImageUploadError('Upload timeout - please try again');
        }
        throw new ImageUploadError(`Network error: ${fetchError.message || 'Unknown error'}`);
      }
    } catch (error) {
      const uploadError = error instanceof ImageUploadError ? error : new ImageUploadError('Upload failed');
      
      reportError(uploadError, 'Image Upload', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      toast({
        title: "Upload Failed",
        description: uploadError.message,
        variant: "destructive",
      });
      
      return {
        success: 0,
        error: uploadError.message
      };
    }
  }, [toast]);

  // Initialize Editor.js with comprehensive error handling
  const initializeEditor = useCallback(async () => {
    if (editorInstanceRef.current || hasError) {
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);

      // Validate holder element exists
      const holderElement = document.getElementById(holderIdRef.current);
      if (!holderElement) {
        throw new EditorInitializationError(`Editor holder element not found: ${holderIdRef.current}`);
      }

      // Validate data structure
      if (!validateEditorData(validatedData)) {
        throw new EditorDataError('Invalid Editor.js data structure', validatedData);
      }

      console.log(`Initializing EditorJS for holder: ${holderIdRef.current}`);
      
      const editor = new EditorJS({
        holder: holderIdRef.current,
        placeholder: placeholder,
        readOnly: readOnly,
        data: validatedData,
        minHeight: minHeight,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2
            }
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          },
          // checklist: {
          //   class: Checklist,
          //   inlineToolbar: true,
          // },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author',
            },
          },
          warning: {
            class: Warning,
            inlineToolbar: true,
            config: {
              titlePlaceholder: 'Title',
              messagePlaceholder: 'Message',
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: handleImageUpload,
                uploadByUrl(url: string) {
                  return Promise.resolve({
                    success: 1,
                    file: {
                      url: url,
                    }
                  });
                }
              },
              captionPlaceholder: 'Caption (optional)',
              buttonContent: 'Select an image',
              withBorder: true,
              withBackground: false,
              withResize: true,
            }
          },
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link-preview', // You can implement this endpoint
            }
          },
          code: {
            class: CodeTool,
            config: {
              placeholder: 'Enter code',
            }
          },
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                codepen: true,
                instagram: true,
                twitter: true,
                github: true,
              }
            }
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            }
          },
          delimiter: Delimiter,
          // raw: {
          //   class: Raw,
          //   config: {
          //     placeholder: 'Enter HTML code',
          //   }
          // },
          marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M',
          },
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+C',
          }
        },
        onReady: () => {
          console.log('Editor.js is ready.');
          editorInstanceRef.current = editor;
          isReadyRef.current = true;
          setIsLoading(false);
          onReady?.();
        },
        onChange: async (api, event) => {
          if (!readOnly && api.saver && isReadyRef.current) {
            try {
              const savedData = await api.saver.save();
              
              // Validate saved data before calling onChange
              if (validateEditorData(savedData) && JSON.stringify(savedData) !== JSON.stringify(validatedData)) {
                onChange(savedData);
              }
            } catch (error) {
              const saveError = new EditorDataError('Failed to save editor data', { error, event });
              reportError(saveError, 'Editor Save');
              onError?.(saveError);
            }
          }
        },
      });

      // Wait for editor to be ready
      await editor.isReady;
      
    } catch (error) {
      const initError = error instanceof EditorInitializationError || error instanceof EditorDataError 
        ? error 
        : new EditorInitializationError('Failed to initialize Editor.js', error as Error);
      
      reportError(initError, 'Editor Initialization', {
        holder: holderIdRef.current,
        data: validatedData
      });
      
      setHasError(true);
      setIsLoading(false);
      onError?.(initError);
      
      toast({
        title: "Editor Error",
        description: "Failed to initialize the editor. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [validatedData, placeholder, readOnly, minHeight, onError, onReady, toast]);

  useEffect(() => {
    initializeEditor();
  }, [initializeEditor]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
      console.log(`Destroying EditorJS instance for holder: ${holderIdRef.current}`);
      try {
        editorInstanceRef.current.destroy();
      } catch (error) {
        reportError(error as Error, 'Editor Cleanup');
      } finally {
        editorInstanceRef.current = null;
        isReadyRef.current = false;
      }
    }
  }, []);

  // Handle data updates
  useEffect(() => {
    if (isReadyRef.current && editorInstanceRef.current && validatedData) {
      editorInstanceRef.current.isReady
        .then(async () => {
          try {
            const currentData = await editorInstanceRef.current?.save();
            
            if (currentData && JSON.stringify(currentData.blocks) !== JSON.stringify(validatedData.blocks)) {
              console.log("External data changed, rendering new data:", validatedData);
              await editorInstanceRef.current?.clear();
              await editorInstanceRef.current?.render(validatedData);
            } else {
              console.log("External data is the same as current editor data, skipping render.");
            }
          } catch (error) {
            const renderError = new EditorDataError('Failed to render editor data', { error, data: validatedData });
            reportError(renderError, 'Editor Data Update');
            onError?.(renderError);
          }
        })
        .catch((error) => {
          const updateError = new EditorDataError('Failed to update editor data', { error, data: validatedData });
          reportError(updateError, 'Editor Data Update');
          onError?.(updateError);
        });
    }
  }, [validatedData, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Render with error states
  if (hasError) {
    return (
      <div className="prose max-w-none min-h-[200px] border-2 border-dashed border-red-300 rounded-lg p-8 text-center">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium">Editor Failed to Load</h3>
          <p className="text-sm text-gray-600 mt-2">
            There was an error initializing the editor. Please refresh the page to try again.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              initializeEditor();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="prose max-w-none min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={holderIdRef.current} 
      className="prose max-w-none" 
      style={{ 
        minHeight: `${minHeight}px`,
        maxHeight: maxHeight ? `${maxHeight}px` : 'none',
        overflowY: maxHeight ? 'auto' : 'visible'
      }} 
    />
  );
});

Editor.displayName = 'Editor';

export default Editor; 