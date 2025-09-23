"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Upload, X, Check } from "lucide-react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper function to draw cropped image on canvas
function drawCroppedImage(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * (Math.PI / 180);
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();
}

interface ProfilePhotoUploadProps {
  currentUser: any;
  onPhotoUpdate: (photoUrl: string) => void;
}

export function ProfilePhotoUpload({ currentUser, onPhotoUpdate }: ProfilePhotoUploadProps) {
  const [open, setOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [isUploading, setIsUploading] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();

  // Listen for custom event to open photo upload
  useEffect(() => {
    const handleOpenPhotoUpload = () => {
      setOpen(true);
    };

    window.addEventListener('openPhotoUpload', handleOpenPhotoUpload);
    return () => {
      window.removeEventListener('openPhotoUpload', handleOpenPhotoUpload);
    };
  }, []);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ), width, height));
    }
  }


  const onCropComplete = useCallback((crop: PixelCrop) => {
    setCompletedCrop(crop);
  }, []);

  const onCropChange = useCallback((crop: Crop) => {
    setCrop(crop);
  }, []);

  // Draw cropped image on canvas when crop changes
  useEffect(() => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
      drawCroppedImage(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotate
      );
    }
  }, [completedCrop, scale, rotate]);

  const handleSavePhoto = async () => {
    if (!completedCrop || !previewCanvasRef.current) {
      toast({
        title: "No crop selected",
        description: "Please select an area to crop",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert canvas to blob
      const canvas = previewCanvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Create FormData for upload
        const formData = new FormData();
        formData.append('photo', blob, 'profile-photo.jpg');
        formData.append('userId', currentUser._id || currentUser.id);

        console.log('Uploading photo for user:', currentUser._id || currentUser.id);
        console.log('Blob size:', blob.size);

        // Upload to your API endpoint
        const response = await fetch('/api/community/upload-photo', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          onPhotoUpdate(data.photoUrl);
          setOpen(false);
          toast({
            title: "Photo updated!",
            description: "Your profile photo has been updated successfully.",
          });
        } else {
          throw new Error(data.error || 'Failed to upload photo');
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
            <DialogDescription>
              Upload and crop your profile photo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  <span>Choose Photo</span>
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="hidden"
                />
              </label>
            </div>

            {imgSrc && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAspect(aspect ? undefined : 1)}
                  >
                    {aspect ? 'Free' : 'Square'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotate(r => r + 90)}
                  >
                    Rotate
                  </Button>
                </div>

                <div className="flex justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={onCropChange}
                    onComplete={onCropComplete}
                    aspect={aspect}
                    minWidth={50}
                    minHeight={50}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imgSrc}
                      style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                      onLoad={onImageLoad}
                      className="max-h-64"
                    />
                  </ReactCrop>
                </div>

                {completedCrop && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 text-center">
                      Preview
                    </div>
                    <div className="flex justify-center">
                      <canvas
                        ref={previewCanvasRef}
                        className="rounded-full border"
                        style={{
                          width: 100,
                          height: 100,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePhoto}
                    disabled={!completedCrop || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Photo
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}