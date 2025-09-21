'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { BlogPost } from '@/types/blog-post';

interface BlogPreviewCardProps {
  post: BlogPost;
}

export default function BlogPreviewCard({ post }: BlogPreviewCardProps) {
  // Limit excerpt length for preview
  const previewExcerpt = post.excerpt 
    ? post.excerpt.length > 100 
      ? post.excerpt.substring(0, 100) + '...' 
      : post.excerpt
    : 'No excerpt available.';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/blog/${post._id}`} className="block">
        <CardContent className="p-0">
          {post.coverImage ? (
            <div className="relative h-48 w-full">
              <Image
                src={post.coverImage}
                alt={post.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
          ) : (
            <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <div className="p-4">
            {post.category && (
              <Badge variant="outline" className="mb-2">{post.category}</Badge>
            )}
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{previewExcerpt}</p>
            <span className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
} 