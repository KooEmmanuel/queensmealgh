'use client';

import React, { useEffect, useRef, memo } from 'react';
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
              levels: [1, 2, 3, 4],
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
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author',
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file: File) {
                  return new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onloadend = () => {
                      resolve({
                        success: 1,
                        file: {
                          url: reader.result as string,
                        }
                      });
                    };

                    reader.onerror = (error) => {
                      console.error("FileReader error:", error);
                      reject(error);
                    };

                    reader.readAsDataURL(file);
                  });
                },
                uploadByUrl(url: string) {
                  return Promise.resolve({
                    success: 1,
                    file: {
                      url: url,
                    }
                  });
                }
              }
            }
          },
          code: CodeTool,
          embed: Embed,
          table: Table,
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