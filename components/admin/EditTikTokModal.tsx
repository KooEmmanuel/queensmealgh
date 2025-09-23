'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { ImageUploadPreview } from './ImageUploadPreview';
import Image from "next/image";

interface TikTokPost {
  _id: string;
  videoUrl: string;
  title: string;
  thumbnail: string;
  views: string;
  duration: string;
  isPlayable: boolean;
}

interface EditTikTokModalProps {
  post: TikTokPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: TikTokPost) => Promise<void>;
}

export function EditTikTokModal({ post, isOpen, onClose, onSave }: EditTikTokModalProps) {
  const [formData, setFormData] = useState<Partial<TikTokPost>>({});
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const { toast } = useToast();

  // Reset form when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        _id: post._id,
        videoUrl: post.videoUrl,
        title: post.title,
        views: post.views,
        duration: post.duration,
        isPlayable: post.isPlayable,
      });
    } else {
      setFormData({});
    }
    setImage(null);
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('id', post._id);
      data.append('videoUrl', formData.videoUrl || '');
      data.append('title', formData.title || '');
      data.append('views', formData.views || '0');
      data.append('duration', formData.duration || '0:00');
      data.append('isPlayable', String(formData.isPlayable));
      
      if (image) {
        data.append('image', image);
      }
      
      const response = await fetch(`/api/admin/tiktok?id=${post._id}`, {
        method: 'PUT',
        body: data
      });
      
      if (!response.ok) {
        throw new Error('Failed to update video');
      }
      
      const updatedPost = await response.json();
      
      // Call the onSave callback with the updated post
      await onSave({
        ...post,
        ...formData,
        thumbnail: updatedPost.thumbnail || post.thumbnail
      } as TikTokPost);
      
      toast({
        title: "✅ TikTok Video Updated!",
        description: "Your TikTok video has been successfully updated.",
        duration: 4000,
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating video:', error);
      toast({
        title: "❌ Update Failed",
        description: "Failed to update TikTok video. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
          <DialogTitle>Edit TikTok Video</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-videoUrl">TikTok Video URL</Label>
            <Input 
              id="edit-videoUrl" 
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input 
              id="edit-title" 
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-views">Views</Label>
              <Input 
                id="edit-views" 
                value={formData.views || ''}
                onChange={(e) => setFormData({...formData, views: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration</Label>
              <Input 
                id="edit-duration" 
                value={formData.duration || ''}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Current Thumbnail</Label>
            <div className="relative h-40 w-full border rounded-md overflow-hidden">
              {post.thumbnail && post.thumbnail.startsWith('data:') ? (
                <Image 
                  src={post.thumbnail} 
                  alt={post.title}
                  fill
                  className="object-contain"
                />
              ) : post.thumbnail ? (
                <Image 
                  src={post.thumbnail} 
                  alt={post.title}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                  No Image
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Upload New Thumbnail</Label>
            <ImageUploadPreview onImageSelect={setImage} />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-isPlayable"
              checked={formData.isPlayable}
              onChange={(e) => setFormData({...formData, isPlayable: e.target.checked})}
              className="rounded border-gray-300"
            />
            <Label htmlFor="edit-isPlayable">Is this video playable?</Label>
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 