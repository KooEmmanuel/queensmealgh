'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Heading1, Heading2, Heading3, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Video
} from 'lucide-react';
import { Button } from './button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  controls?: string[][];
}

export function RichTextEditor({ value, onChange, controls }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="border rounded-md p-4 h-64 bg-gray-50"></div>;
  }

  const defaultControls = [
    ['bold', 'italic', 'underline', 'link'],
    ['h1', 'h2', 'h3'],
    ['unorderedList', 'orderedList'],
  ];

  const controlsToRender = controls || defaultControls;

  return (
    <div className="rich-text-editor">
      <div className="border-b p-2 flex flex-wrap gap-1">
        {controlsToRender.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-1 mr-2">
            {group.map(control => {
              switch (control) {
                case 'bold':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={editor.isActive('bold') ? 'bg-gray-200' : ''}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  );
                case 'italic':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={editor.isActive('italic') ? 'bg-gray-200' : ''}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  );
                case 'underline':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                      className={editor.isActive('underline') ? 'bg-gray-200' : ''}
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </Button>
                  );
                case 'link':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url = window.prompt('URL');
                        if (url) {
                          editor.chain().focus().setLink({ href: url }).run();
                        }
                      }}
                      className={editor.isActive('link') ? 'bg-gray-200' : ''}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  );
                case 'h1':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                  );
                case 'h2':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                  );
                case 'h3':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                  );
                case 'unorderedList':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  );
                case 'orderedList':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  );
                case 'alignLeft':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('left').run()}
                      className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  );
                case 'alignCenter':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('center').run()}
                      className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  );
                case 'alignRight':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('right').run()}
                      className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  );
                case 'image':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url = window.prompt('Image URL');
                        if (url) {
                          editor.chain().focus().setImage({ src: url }).run();
                        }
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  );
                case 'video':
                  return (
                    <Button
                      key={control}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url = window.prompt('Video embed URL (YouTube, Vimeo, etc.)');
                        if (url) {
                          // Insert an iframe with the video URL
                          editor.chain().focus().insertContent(`<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`).run();
                        }
                      }}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  );
                default:
                  return null;
              }
            })}
          </div>
        ))}
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[200px]" />
    </div>
  );
} 