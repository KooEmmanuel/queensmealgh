'use client';

import React, { useEffect, useRef, memo, useCallback } from 'react';
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
import Checklist from '@editorjs/checklist';
import Raw from '@editorjs/raw';
import { useToast } from '@/components/ui/use-toast';

interface EditorProps {
  data: OutputData;
  onChange: (data: OutputData) => void;
  holder?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export const Editor = memo(({
  data,
  onChange,
  holder = 'editorjs-container',
  placeholder = 'Let`s write an awesome story!',
  readOnly = false,
}: EditorProps) => {
  const editorInstanceRef = useRef<EditorJS | null>(null);
  const isReadyRef = useRef(false);
  const holderIdRef = useRef(holder);
  const { toast } = useToast();

  // Enhanced image upload handler with server upload
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Create FormData for server upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'blog-content');

      // Upload to server
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      return {
        success: 1,
        file: {
          url: result.url,
          name: file.name,
          size: file.size,
        }
      };
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      
      return {
        success: 0,
        error: error instanceof Error ? error.message : "Upload failed"
      };
    }
  }, [toast]);

  useEffect(() => {
    if (!editorInstanceRef.current) {
      console.log(`Initializing EditorJS for holder: ${holderIdRef.current}`);
      const editor = new EditorJS({
        holder: holderIdRef.current,
        placeholder: placeholder,
        readOnly: readOnly,
        data: data,
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
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
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
          raw: {
            class: Raw,
            config: {
              placeholder: 'Enter HTML code',
            }
          },
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
        },
        onChange: async (api, event) => {
          if (!readOnly && api.saver && isReadyRef.current) {
            try {
              const savedData = await api.saver.save();
              if (JSON.stringify(savedData) !== JSON.stringify(data)) {
                onChange(savedData);
              }
            } catch (error) {
              console.error('Error saving Editor.js data:', error);
            }
          }
        },
      });
    }

    return () => {
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
        console.log(`Destroying EditorJS instance for holder: ${holderIdRef.current}`);
        try {
          editorInstanceRef.current.destroy();
        } catch (error) {
          console.error("Error destroying Editor.js instance:", error);
        } finally {
          editorInstanceRef.current = null;
          isReadyRef.current = false;
        }
      }
    };
  }, [holderIdRef, placeholder, readOnly]);

  useEffect(() => {
    if (isReadyRef.current && editorInstanceRef.current && data) {
      editorInstanceRef.current.isReady
        .then(() => {
          return editorInstanceRef.current?.save();
        })
        .then((currentData) => {
          if (currentData && JSON.stringify(currentData.blocks) !== JSON.stringify(data.blocks)) {
            console.log("External data changed, rendering new data:", data);
            editorInstanceRef.current?.clear();
            editorInstanceRef.current?.render(data);
          } else {
            console.log("External data is the same as current editor data, skipping render.");
          }
        })
        .catch((error) => {
          console.error("Error handling external data update in Editor.js:", error);
        });
    }
  }, [data]);

  return <div id={holderIdRef.current} className="prose max-w-none min-h-[200px]" />;
});

Editor.displayName = 'Editor';

export default Editor; 