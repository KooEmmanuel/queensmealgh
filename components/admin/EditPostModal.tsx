'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ImageUploadPreview } from './ImageUploadPreview';
import Image from "next/image";

interface InstagramPost {
  _id: string;
  postUrl: string;
  caption: string;
  thumbnail: string;
  likes: number;
  comments: number;
  timestamp: string;
  isPlayable: boolean;
}

interface EditPostModalProps {
  post: InstagramPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: InstagramPost) => Promise<void>;
}

export function EditPostModal({ post, isOpen, onClose, onSave }: EditPostModalProps) {
  const [formData, setFormData] = useState<Partial<InstagramPost>>({});
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  // Reset form when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        _id: post._id,
        postUrl: post.postUrl,
        caption: post.caption,
        isPlayable: post.isPlayable,
        // Don't include the image here, we'll handle it separately
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
      data.append('postUrl', formData.postUrl || '');
      data.append('caption', formData.caption || '');
      data.append('isPlayable', String(formData.isPlayable));
      
      if (image) {
        data.append('image', image);
      }
      
      const response = await fetch(`/api/admin/instagram?id=${post._id}`, {
        method: 'PUT',
        body: data
      });
      
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      
      const updatedPost = await response.json();
      
      // Call the onSave callback with the updated post
      await onSave({
        ...post,
        ...formData,
        thumbnail: updatedPost.thumbnail || post.thumbnail
      } as InstagramPost);
      
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
          <DialogTitle>Edit Instagram Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-postUrl">Instagram Post URL</Label>
            <Input 
              id="edit-postUrl" 
              value={formData.postUrl || ''}
              onChange={(e) => setFormData({...formData, postUrl: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-caption">Caption</Label>
            <Textarea 
              id="edit-caption" 
              value={formData.caption || ''}
              onChange={(e) => setFormData({...formData, caption: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Current Thumbnail</Label>
            <div className="relative h-40 w-full border rounded-md overflow-hidden">
              {post.thumbnail && post.thumbnail.startsWith('data:') ? (
                <Image 
                  src={post.thumbnail} 
                  alt={post.caption}
                  fill
                  className="object-contain"
                />
              ) : post.thumbnail ? (
                <Image 
                  src={post.thumbnail} 
                  alt={post.caption}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
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
            <Label htmlFor="edit-isPlayable">Is this a video/reel?</Label>
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