'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

interface RelatedPostsProps {
  currentPostId: string;
  category: string;
}

export default function RelatedPosts({ currentPostId, category }: RelatedPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const response = await fetch(`/api/blog/related?id=${currentPostId}&category=${category}`);
        if (!response.ok) {
          throw new Error('Failed to fetch related posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPostId, category]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Related Articles</h3>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Link href={`/blog/${post._id}`} key={post._id}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                <div className="relative h-24 w-24">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium line-clamp-2">{post.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 