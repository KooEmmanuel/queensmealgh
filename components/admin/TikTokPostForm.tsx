'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ImageUploadPreview } from './ImageUploadPreview';

export function TikTokPostForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    views: '',
    duration: '',
    image: null as File | null,
    isPlayable: true
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('videoUrl', formData.videoUrl);
      data.append('title', formData.title);
      data.append('views', formData.views);
      data.append('duration', formData.duration);
      data.append('isPlayable', String(formData.isPlayable));
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      const response = await fetch('/api/admin/tiktok', {
        method: 'POST',
        body: data
      });
      
      if (!response.ok) {
        throw new Error('Failed to add TikTok video');
      }
      
      // Reset form
      setFormData({
        videoUrl: '',
        title: '',
        views: '',
        duration: '',
        image: null,
        isPlayable: true
      });
      
      alert('TikTok video added successfully!');
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Failed to add video. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New TikTok Video</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">TikTok Video URL</Label>
            <Input 
              id="videoUrl" 
              placeholder="https://www.tiktok.com/@queensmeal12/video/7123456789012345678" 
              value={formData.videoUrl}
              onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Enter video title..." 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="views">Views</Label>
              <Input 
                id="views" 
                placeholder="e.g. 1.2K" 
                value={formData.views}
                onChange={(e) => setFormData({...formData, views: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input 
                id="duration" 
                placeholder="e.g. 0:30" 
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
            </div>
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
            <Label htmlFor="isPlayable">Is this video playable?</Label>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Video...
              </>
            ) : (
              'Add TikTok Video'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 