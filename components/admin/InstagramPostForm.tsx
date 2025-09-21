'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { ImageUploadPreview } from './ImageUploadPreview';

export function InstagramPostForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    postUrl: '',
    caption: '',
    image: null as File | null,
    isPlayable: true
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('postUrl', formData.postUrl);
      data.append('caption', formData.caption);
      data.append('isPlayable', String(formData.isPlayable));
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      const response = await fetch('/api/admin/instagram', {
        method: 'POST',
        body: data
      });
      
      if (!response.ok) {
        throw new Error('Failed to add Instagram post');
      }
      
      // Reset form
      setFormData({
        postUrl: '',
        caption: '',
        image: null,
        isPlayable: true
      });
      
      alert('Instagram post added successfully!');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        image: e.target.files[0]
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Instagram Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="postUrl">Instagram Post URL</Label>
            <Input 
              id="postUrl" 
              placeholder="https://www.instagram.com/queensmeal12/reel/DId5_uLNRlr/" 
              value={formData.postUrl}
              onChange={(e) => setFormData({...formData, postUrl: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea 
              id="caption" 
              placeholder="Enter post caption..." 
              value={formData.caption}
              onChange={(e) => setFormData({...formData, caption: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Upload Thumbnail Image</Label>
            <ImageUploadPreview 
              onImageSelect={(file) => setFormData({...formData, image: file})}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPlayable"
              checked={formData.isPlayable}
              onChange={(e) => setFormData({...formData, isPlayable: e.target.checked})}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPlayable">Is this a video/reel?</Label>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Post...
              </>
            ) : (
              'Add Instagram Post'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 