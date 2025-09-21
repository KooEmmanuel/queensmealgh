'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Image as ImageIcon, 
  Type, 
  ListOrdered, 
  List, 
  Code, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Grip,
  X,
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Portal } from "@/components/ui/portal"
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'image' | 'list' | 'orderedList' | 'quote' | 'code';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  imageUrl?: string;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

const BLOCK_TYPES = {
  paragraph: {
    label: 'Text',
    icon: Type,
    shortcut: '/',
  },
  heading1: {
    label: 'Heading 1',
    icon: Heading1, 
    shortcut: '# ',
  },
  heading2: {
    label: 'Heading 2',
    icon: Heading2,
    shortcut: '## ',
  },
  list: {
    label: 'Bullet List',
    icon: List,
    shortcut: '- ',
  },
  orderedList: {
    label: 'Numbered List', 
    icon: ListOrdered,
    shortcut: '1. ',
  },
  quote: {
    label: 'Quote',
    icon: Quote,
    shortcut: '> ',
  },
  code: {
    label: 'Code',
    icon: Code,
    shortcut: '```',
  }
} as const;

interface SortableBlockProps {
  block: Block;
  index: number;
  renderBlockContent: (block: Block) => React.ReactNode;
  activeBlockId: string | null;
  removeBlock: (id: string) => void;
}

function SortableBlock({ 
  block, 
  index, 
  renderBlockContent, 
  activeBlockId, 
  removeBlock, 
  ...props 
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-start gap-2"
      {...attributes}
    >
      <div className="absolute -left-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-move"
          {...listeners}
        >
          <Grip className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
      <div className="flex-grow">
        {renderBlockContent(block)} 
      </div>
      
      {activeBlockId === block.id && (
        <div className="absolute -right-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeBlock(block.id)}
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandMenuPosition, setCommandMenuPosition] = useState({ x: 0, y: 0 });
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);
  const [dragMenuOffset, setDragMenuOffset] = useState({ x: 0, y: 0 });
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const commandMenuRef = useRef<HTMLDivElement>(null);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Hold for 250ms before drag starts
        tolerance: 5,
      },
    })
  );

  const handleBlockChange = (id: string, content: string) => {
    const newBlocks = blocks.map(block => 
      block.id === id ? { ...block, content } : block
    );
    onChange(newBlocks);
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string, index: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Handle shortcuts
    for (const [type, config] of Object.entries(BLOCK_TYPES)) {
      if (block.content.startsWith(config.shortcut)) {
        e.preventDefault();
        changeBlockType(blockId, type as BlockType);
        handleBlockChange(blockId, block.content.slice(config.shortcut.length));
        return;
      }
    }

    // Show command menu on '/'
    if (e.key === '/' && !showCommandMenu) {
      e.preventDefault();
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      
      if (rect) {
        // Position menu right below the cursor
        setCommandMenuPosition({
          x: rect.left,
          y: rect.bottom + window.scrollY + 5
        });
        setShowCommandMenu(true);
      }
      return;
    }

    // Existing key handlers...
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlock: Block = { 
        id: uuidv4(), 
        type: 'paragraph',
        content: '' 
      };
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      onChange(newBlocks);
      setActiveBlockId(newBlock.id);
    }

    // Handle backspace at start of block to change type
    if (e.key === 'Backspace' && window.getSelection()?.anchorOffset === 0) {
      e.preventDefault();
      changeBlockType(blockId, 'paragraph');
    }

    // Handle tab for nested lists
    if (e.key === 'Tab') {
      e.preventDefault();
      // Implement list nesting logic here
    }
  };

  const addBlock = (type: BlockType, index: number) => {
    const newBlock: Block = { id: uuidv4(), type, content: '' };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
    setActiveBlockId(newBlock.id);
    setShowBlockMenu(null);
  };

  const changeBlockType = (id: string, newType: Block['type']) => {
    const newBlocks = blocks.map(block => 
      block.id === id ? { ...block, type: newType } : block
    );
    onChange(newBlocks);
    setShowBlockMenu(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        const newBlock = { id: uuidv4(), type: 'image' as const, content: '', imageUrl };
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        onChange(newBlocks);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      onChange(blocks.filter(block => block.id !== id));
    }
  };

  useEffect(() => {
    // Focus the active block
    if (activeBlockId && blockRefs.current[activeBlockId]) {
      const el = blockRefs.current[activeBlockId];
      if (el) {
        el.focus();
        // Place cursor at the end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [activeBlockId]);

  const renderBlockContent = (block: Block) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <div
            ref={(el) => { 
              blockRefs.current[block.id] = el;
              // Initialize content if the element is empty
              if (el && !el.textContent && block.content) {
                el.textContent = block.content;
              }
            }}
            contentEditable
            className={`prose max-w-none focus:outline-none min-h-[1.5em] px-3 py-1 rounded-md 
              ${activeBlockId === block.id ? 'bg-gray-50' : 'hover:bg-gray-50'}
              ${!block.content ? 'before:content-[attr(data-placeholder)] before:text-gray-400 before:pointer-events-none' : ''}
            `}
            data-placeholder="Type '/' for commands..."
            onFocus={() => setActiveBlockId(block.id)}
            onBlur={() => setActiveBlockId(null)}
            suppressContentEditableWarning
            onInput={(e) => handleBlockChange(block.id, e.currentTarget.textContent || '')}
            onKeyDown={(e) => handleKeyDown(e, block.id, blocks.indexOf(block))}
          />
        );

      case 'heading1':
        return (
          <div
            ref={(el) => { 
              blockRefs.current[block.id] = el;
              // Initialize content if the element is empty
              if (el && !el.textContent && block.content) {
                el.textContent = block.content;
              }
            }}
            contentEditable
            className="prose max-w-none text-3xl font-bold focus:outline-none min-h-[1.5em] px-3 py-1 rounded-md hover:bg-gray-50"
            onFocus={() => setActiveBlockId(block.id)}
            onBlur={() => setActiveBlockId(null)}
            suppressContentEditableWarning
            onInput={(e) => handleBlockChange(block.id, e.currentTarget.textContent || '')}
            onKeyDown={(e) => handleKeyDown(e, block.id, blocks.indexOf(block))}
          />
        );

      case 'heading2':
        return (
          <div
            ref={(el) => { 
              blockRefs.current[block.id] = el;
              // Initialize content if the element is empty
              if (el && !el.textContent && block.content) {
                el.textContent = block.content;
              }
            }}
            contentEditable
            className="prose max-w-none text-2xl font-bold focus:outline-none min-h-[1.5em] px-3 py-1 rounded-md hover:bg-gray-50"
            onFocus={() => setActiveBlockId(block.id)}
            onBlur={() => setActiveBlockId(null)}
            suppressContentEditableWarning
            onInput={(e) => handleBlockChange(block.id, e.currentTarget.textContent || '')}
            onKeyDown={(e) => handleKeyDown(e, block.id, blocks.indexOf(block))}
          />
        );

      case 'list':
        return (
          <div
            ref={(el) => { 
              blockRefs.current[block.id] = el;
              // Initialize content if the element is empty
              if (el && !el.textContent && block.content) {
                el.textContent = block.content;
              }
            }}
            contentEditable
            className="prose max-w-none list-disc ml-6 focus:outline-none min-h-[1.5em] px-3 py-1 rounded-md hover:bg-gray-50"
            onFocus={() => setActiveBlockId(block.id)}
            onBlur={() => setActiveBlockId(null)}
            suppressContentEditableWarning
            onInput={(e) => handleBlockChange(block.id, e.currentTarget.textContent || '')}
            onKeyDown={(e) => handleKeyDown(e, block.id, blocks.indexOf(block))}
          />
        );

      case 'orderedList':
        return (
          <div
            ref={(el) => { 
              blockRefs.current[block.id] = el;
              // Initialize content if the element is empty
              if (el && !el.textContent && block.content) {
                el.textContent = block.content;
              }
            }}
            contentEditable
            className="prose max-w-none list-decimal ml-6 focus:outline-none min-h-[1.5em] px-3 py-1 rounded-md hover:bg-gray-50"
            onFocus={() => setActiveBlockId(block.id)}
            onBlur={() => setActiveBlockId(null)}
            suppressContentEditableWarning
            onInput={(e) => handleBlockChange(block.id, e.currentTarget.textContent || '')}
            onKeyDown={(e) => handleKeyDown(e, block.id, blocks.indexOf(block))}
          />
        );

      case 'quote':
        return (
          <div
            ref={(el) => { 
              blockRefs.current[block.id] = el;
              // Initialize content if the element is empty
              if (el && !el.textContent && block.content) {
                el.textContent = block.content;
              }
            }}
            contentEditable
            className="prose max-w-none border-l-4 border-gray-200 pl-4 italic focus:outline-none min-h-[1.5em] px-3 py-1 rounded-md hover:bg-gray-50"
            onFocus={() => setActiveBlockId(block.id)}
            onBlur={() => setActiveBlockId(null)}
            suppressContentEditableWarning
            onInput={(e) => handleBlockChange(block.id, e.currentTarget.textContent || '')}
            onKeyDown={(e) => handleKeyDown(e, block.id, blocks.indexOf(block))}
          />
        );

      case 'code':
        return (
          <div
            ref={(el) => { 
              blockRefs.current[block.id] = el;
              // Initialize content if the element is empty
              if (el && !el.textContent && block.content) {
                el.textContent = block.content;
              }
            }}
            contentEditable
            className="font-mono bg-gray-100 rounded-md p-4 focus:outline-none min-h-[1.5em]"
            onFocus={() => setActiveBlockId(block.id)}
            onBlur={() => setActiveBlockId(null)}
            suppressContentEditableWarning
            onInput={(e) => handleBlockChange(block.id, e.currentTarget.textContent || '')}
            onKeyDown={(e) => handleKeyDown(e, block.id, blocks.indexOf(block))}
          />
        );

      case 'image':
        return (
          <div className="relative">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
              <Image
                src={block.imageUrl || ''}
                alt="Block image"
                fill
                className="object-cover"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => removeBlock(block.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // --- Draggable Menu Logic ---
  const handleMenuMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!commandMenuRef.current) return;
    // Prevent drag initiation if clicking on input/items
    if ((e.target as HTMLElement).closest('input, [role="menuitem"]')) {
       return;
    }
    setIsDraggingMenu(true);
    const menuRect = commandMenuRef.current.getBoundingClientRect();
    setDragMenuOffset({
      x: e.clientX - menuRect.left,
      y: e.clientY - menuRect.top,
    });
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMenuMouseMove = (e: MouseEvent) => {
    if (!isDraggingMenu) return;
    setCommandMenuPosition({
      x: e.clientX - dragMenuOffset.x,
      y: e.clientY - dragMenuOffset.y,
    });
  };

  const handleMenuMouseUp = () => {
    if (isDraggingMenu) {
      setIsDraggingMenu(false);
    }
  };

  // Add/Remove global listeners for dragging
  useEffect(() => {
    if (isDraggingMenu) {
      document.addEventListener('mousemove', handleMenuMouseMove);
      document.addEventListener('mouseup', handleMenuMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMenuMouseMove);
      document.removeEventListener('mouseup', handleMenuMouseUp);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMenuMouseMove);
      document.removeEventListener('mouseup', handleMenuMouseUp);
    };
  }, [isDraggingMenu, dragMenuOffset]); // Add dragMenuOffset dependency

  // --- End Draggable Menu Logic ---

  // Command menu component
  const CommandMenu = () => (
    <Portal>
      <Command
        ref={commandMenuRef}
        onMouseDown={handleMenuMouseDown}
        className={`fixed z-[9999] w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden ${isDraggingMenu ? 'cursor-grabbing' : ''}`}
        style={{
          left: `${commandMenuPosition.x}px`,
          top: `${commandMenuPosition.y}px`,
          maxHeight: '300px',
          userSelect: isDraggingMenu ? 'none' : 'auto'
        }}
      >
        <CommandInput autoFocus placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Basic blocks">
            {Object.entries(BLOCK_TYPES).map(([type, config]) => (
              <CommandItem
                key={type}
                onSelect={() => {
                  if (activeBlockId) {
                    // Get the current block content
                    const currentBlock = blocks.find(b => b.id === activeBlockId);
                    const content = currentBlock?.content || '';
                    
                    // Change the block type
                    changeBlockType(activeBlockId, type as BlockType);
                    
                    // Focus the block after type change
                    setTimeout(() => {
                      const el = blockRefs.current[activeBlockId];
                      if (el) {
                        el.focus();
                        // Place cursor at the end
                        const selection = window.getSelection();
                        const range = document.createRange();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                      }
                    }, 10);
                    
                    setShowCommandMenu(false);
                  }
                }}
              >
                <config.icon className="h-4 w-4 mr-2" />
                {config.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </Portal>
  );

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commandMenuRef.current && !commandMenuRef.current.contains(e.target as Node)) {
        setShowCommandMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedBlock(blocks.find(block => block.id === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id);
      const newIndex = blocks.findIndex(block => block.id === over.id);
      
      const newBlocks = [...blocks];
      const [movedBlock] = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, movedBlock);
      
      onChange(newBlocks);
    }
    
    setDraggedBlock(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4 relative">
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => (
            <SortableBlock 
              key={block.id} 
              block={block} 
              index={index} 
              renderBlockContent={renderBlockContent}
              activeBlockId={activeBlockId}
              removeBlock={removeBlock}
            />
          ))}
        </SortableContext>
        
        <DragOverlay>
          {draggedBlock ? (
            <div className="opacity-50 bg-white p-2 rounded shadow-lg"> 
              {renderBlockContent(draggedBlock)}
            </div>
          ) : null}
        </DragOverlay>
        
        {/* Add block button */}
        <div className="flex justify-center py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => addBlock('paragraph', blocks.length - 1)}>
                <Type className="h-4 w-4 mr-2" />
                Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('heading1', blocks.length - 1)}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('heading2', blocks.length - 1)}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('list', blocks.length - 1)}>
                <List className="h-4 w-4 mr-2" />
                Bullet List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('orderedList', blocks.length - 1)}>
                <ListOrdered className="h-4 w-4 mr-2" />
                Numbered List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('quote', blocks.length - 1)}>
                <Quote className="h-4 w-4 mr-2" />
                Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('code', blocks.length - 1)}>
                <Code className="h-4 w-4 mr-2" />
                Code
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center px-2 py-1.5 text-sm cursor-pointer">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, blocks.length - 1)}
                  />
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {showCommandMenu && <CommandMenu />}
      </div>
    </DndContext>
  );
} 