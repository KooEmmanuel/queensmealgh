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
            return (
              <p key={block.id} className="text-gray-700 leading-relaxed mb-6 text-lg">
                <span dangerouslySetInnerHTML={{ __html: block.data.text }}></span>
              </p>
            );
          case 'header':
            const headerTag = `h${block.data.level}`;
            const headerClasses = {
              1: "text-4xl font-bold text-gray-900 mb-8 mt-12",
              2: "text-3xl font-bold text-gray-900 mb-6 mt-10",
              3: "text-2xl font-semibold text-gray-800 mb-4 mt-8",
              4: "text-xl font-semibold text-gray-800 mb-3 mt-6",
              5: "text-lg font-semibold text-gray-800 mb-3 mt-4",
              6: "text-base font-semibold text-gray-800 mb-2 mt-4"
            };
            return React.createElement(headerTag as string, {
              key: block.id,
              className: headerClasses[block.data.level as keyof typeof headerClasses] || headerClasses[2],
              dangerouslySetInnerHTML: { __html: block.data.text }
            });
          case 'list':
            const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return React.createElement(listTag as string, {
              key: block.id,
              className: block.data.style === 'ordered' ? "list-decimal list-inside pl-6 my-4 space-y-2" : "list-disc list-inside pl-6 my-4 space-y-2"
            },
              block.data.items.map((item: any, index: number) => {
                // Handle both string and object items
                const itemText = typeof item === 'string' ? item : (item.text || item.content || JSON.stringify(item));
                return (
                  <li key={index} className="text-gray-700 leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: itemText }}></span>
                  </li>
                );
              })
            );
          case 'image':
             if (block.data && block.data.file && block.data.file.url) {
               return (
                 <div key={block.id} className="my-6 flex flex-col items-center">
                   <div className="relative w-full max-w-4xl">
                     <Image
                       src={block.data.file.url}
                       alt={block.data.caption || 'Blog image'}
                       width={800}
                       height={600}
                       className="rounded-lg object-contain max-w-full h-auto shadow-sm"
                       style={{ objectFit: 'contain' }}
                     />
                   </div>
                   {block.data.caption && (
                     <p className="text-center text-sm text-gray-600 mt-2 italic">{block.data.caption}</p>
                   )}
                 </div>
               );
             }
             console.warn("Image block is missing data:", block.data);
             return null;
          case 'warning':
             return (
               <div key={block.id} className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
                 <div className="flex">
                   <div className="flex-shrink-0">
                     <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <h3 className="text-sm font-medium text-yellow-800">
                       {block.data.title || 'Warning'}
                     </h3>
                     <div className="mt-2 text-sm text-yellow-700">
                       <p dangerouslySetInnerHTML={{ __html: block.data.message }}></p>
                     </div>
                   </div>
                 </div>
               </div>
             );
          case 'checklist':
             return (
               <div key={block.id} className="my-4">
                 <ul className="space-y-2">
                   {block.data.items.map((item: any, index: number) => (
                     <li key={index} className="flex items-start">
                       <input
                         type="checkbox"
                         checked={item.checked}
                         readOnly
                         className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       />
                       <span className={`ml-3 text-sm ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                         {item.text}
                       </span>
                     </li>
                   ))}
                 </ul>
               </div>
             );
          case 'quote':
            return (
              <blockquote key={block.id} className="border-l-4 border-green-500 pl-8 py-6 my-8 bg-green-50 rounded-r-lg">
                <p className="text-gray-700 italic text-xl leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: block.data.text }}></p>
                {block.data.caption && (
                  <cite className="text-sm text-gray-600 mt-4 block font-medium">— {block.data.caption}</cite>
                )}
              </blockquote>
            );
          case 'delimiter':
             return (
               <div key={block.id} className="my-8 flex justify-center">
                 <div className="text-4xl text-gray-300">***</div>
               </div>
             );
          case 'code':
             return (
               <div key={block.id} className="my-8">
                 <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed">
                   <code>{block.data.code}</code>
                 </pre>
               </div>
             );
          case 'embed':
             return (
               <div key={block.id} className="my-6">
                 <div className="bg-gray-100 p-4 rounded-lg">
                   <div className="aspect-video">
                     <iframe
                       src={block.data.embed}
                       className="w-full h-full rounded"
                       allowFullScreen
                       title="Embedded content"
                     />
                   </div>
                   {block.data.caption && (
                     <p className="text-sm text-gray-600 mt-2">{block.data.caption}</p>
                   )}
                 </div>
               </div>
             );
          case 'table':
             return (
               <div key={block.id} className="my-8 overflow-x-auto">
                 <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                   <tbody>
                     {block.data.content.map((row: string[], rowIndex: number) => (
                       <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                         {row.map((cell: string, cellIndex: number) => (
                           <td key={cellIndex} className="border border-gray-200 px-6 py-4 text-sm text-gray-700">
                             {cell}
                           </td>
                         ))}
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             );
          case 'raw':
             return (
               <div key={block.id} className="my-4">
                 <div dangerouslySetInnerHTML={{ __html: block.data.html }} />
               </div>
             );
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
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {post.coverImage ? (
          <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-[30vh] bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{post.title}</h1>
            </div>
          </div>
        )}
        
        {/* Article Header */}
        <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                  {post.excerpt}
                </p>
              )}
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-8">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">{post.author.name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(post.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                {post.category && (
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="prose prose-lg prose-gray max-w-none">
          {renderEditorJsContent(post.content)}
        </article>
        
        {/* Author Bio */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-bold text-xl">
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About {post.author.name}</h3>
              <p className="text-gray-600 leading-relaxed">
                Food enthusiast and recipe creator passionate about sharing delicious Ghanaian cuisine with the world.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Article
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Posts */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <RelatedPosts 
            currentPostId={params.id} 
            category={post.category || ''} 
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 