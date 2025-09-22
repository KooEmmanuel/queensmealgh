'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react";
import RelatedPosts from "@/components/RelatedPosts";
import { BlogPost } from '@/types/blog-post';
import Footer from '@/components/Footer';

const renderEditorJsContent = (contentInput: string | object) => {
  let contentData: any;

  try {
    if (typeof contentInput === 'string') {
      if (contentInput === "[object Object]") {
         console.error("Error: Received '[object Object]' string instead of valid JSON for content.");
         return <p className="text-red-500">[Error: Invalid content data format received]</p>;
      }
      contentData = JSON.parse(contentInput);
    } else if (typeof contentInput === 'object' && contentInput !== null) {
      contentData = contentInput;
    } else {
       console.error("Error: Invalid content type received:", typeof contentInput);
       return <p className="text-red-500">[Error: Invalid content type]</p>;
    }

    if (contentData && Array.isArray(contentData.blocks)) {
      return contentData.blocks.map((block: any) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={block.id} dangerouslySetInnerHTML={{ __html: block.data.text }}></p>;
          case 'header':
            const headerTag = `h${block.data.level}`;
            return React.createElement(headerTag as string, {
              key: block.id,
              dangerouslySetInnerHTML: { __html: block.data.text }
            });
          case 'list':
            const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return React.createElement(listTag as string, {
              key: block.id,
              className: "list-disc list-inside pl-5"
            },
              block.data.items.map((item: string, index: number) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
              ))
            );
          case 'image':
             if (block.data && block.data.file && block.data.file.url) {
               return (
                 <div key={block.id} className="my-4 flex justify-center">
                   <Image
                     src={block.data.file.url}
                     alt={block.data.caption || 'Blog image'}
                     width={700}
                     height={400}
                     className="rounded-md object-contain max-w-full h-auto"
                     style={{ objectFit: 'contain' }}
                   />
                   {block.data.caption && (
                     <p className="text-center text-sm text-gray-500 mt-1">{block.data.caption}</p>
                   )}
                 </div>
               );
             }
             console.warn("Image block is missing data:", block.data);
             return null;
          default:
            console.warn("Unsupported block type:", block.type);
            return <p key={block.id} className="text-sm text-gray-500">[Unsupported block type: {block.type}]</p>;
        }
      });
    } else {
       console.error("Error: Parsed content does not contain a 'blocks' array:", contentData);
       return <p className="text-red-500">[Error: Invalid content structure]</p>;
    }
  } catch (e) {
    console.error("Failed to parse or render blog content:", e, "Input:", contentInput);
    if (typeof contentInput === 'string' && contentInput !== "[object Object]") {
       return <p>{contentInput}</p>;
    }
    return <p className="text-red-500">[Error processing content]</p>;
  }
};

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/blog/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog post not found');
          } else {
            throw new Error(`Failed to fetch blog post (status: ${response.status})`);
          }
          setPost(null);
          return;
        }
        
        const data: BlogPost = await response.json();
        setPost(data);
      } catch (err: any) {
        console.error('Error fetching blog post:', err);
        setError(err.message || 'Could not load blog post');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchPost();
    }
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse mb-6" />
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-4 w-full" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-8" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <p className="text-red-500 text-lg mb-4">{error || 'Blog post not found'}</p>
        <Link href="/blog">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[40vh] md:h-[50vh] bg-gray-200">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No Header Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white z-10">
          <Link href="/blog">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {post.author.name}
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            {post.category && (
              <span className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                {post.category}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              {post.excerpt && (
                 <p className="lead text-gray-700 mb-6 font-medium">{post.excerpt}</p>
              )}
              {renderEditorJsContent(post.content)}
            </div>
            
            <div className="border-t border-gray-100 mt-8 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden flex-shrink-0">
                    {post.author.avatar ? (
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-semibold">
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{post.author.name}</p>
                    <p className="text-sm text-gray-500">Author</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
          
          <div className="border-t pt-8">
            <RelatedPosts 
              currentPostId={params.id} 
              category={post.category || ''} 
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 