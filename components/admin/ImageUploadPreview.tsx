'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadPreviewProps {
  onImageSelect: (file: File | null) => void;
  initialImage?: string | null;
}

export function ImageUploadPreview({ onImageSelect, initialImage }: ImageUploadPreviewProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    } else {
      setPreview(null);
      onImageSelect(null);
    }
  };

  const handleClearImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Select Image
        </Button>
        
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
        
        {preview && (
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {preview && (
        <div className="relative w-full h-40 mt-4 border rounded-md overflow-hidden">
          <Image 
            src={preview} 
            alt="Preview" 
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
} 