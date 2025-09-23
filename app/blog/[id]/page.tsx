'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react";
import RelatedPosts from "@/components/RelatedPosts";
import { BlogPost } from '@/types/blog-post';
import Footer from '@/components/Footer';

// Utility function to sanitize HTML content
const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  if (typeof html !== 'string') return '';
  
  // Remove potentially dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

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

    // Validate content structure
    if (!contentData || typeof contentData !== 'object') {
      console.error("Error: Content data is not a valid object:", contentData);
      return <p className="text-red-500">[Error: Invalid content structure]</p>;
    }

    if (!Array.isArray(contentData.blocks)) {
      console.error("Error: Content blocks is not an array:", contentData.blocks);
      return <p className="text-red-500">[Error: Content blocks must be an array]</p>;
    }

    return contentData.blocks.map((block: any, index: number) => {
      // Validate block structure
      if (!block || typeof block !== 'object') {
        console.warn(`Invalid block at index ${index}:`, block);
        return <p key={`error-${index}`} className="text-red-500 text-sm">[Invalid block data]</p>;
      }

      if (!block.type || typeof block.type !== 'string') {
        console.warn(`Block at index ${index} missing type:`, block);
        return <p key={`error-${index}`} className="text-red-500 text-sm">[Block missing type]</p>;
      }

      if (!block.data || typeof block.data !== 'object') {
        console.warn(`Block at index ${index} missing data:`, block);
        return <p key={`error-${index}`} className="text-red-500 text-sm">[Block missing data]</p>;
      }

      switch (block.type) {
        case 'paragraph':
          return (
            <p key={block.id || `paragraph-${index}`} className="text-gray-700 leading-relaxed mb-6 text-lg">
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.data.text || '') }}></span>
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
            key: block.id || `header-${index}`,
            className: headerClasses[block.data.level as keyof typeof headerClasses] || headerClasses[2],
            dangerouslySetInnerHTML: { __html: sanitizeHtml(block.data.text || '') }
          });
        case 'list':
          const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
          const listItems = Array.isArray(block.data.items) ? block.data.items : [];
          
          return React.createElement(listTag as string, {
            key: block.id || `list-${index}`,
            className: block.data.style === 'ordered' ? "list-decimal list-inside pl-6 my-4 space-y-2" : "list-disc list-inside pl-6 my-4 space-y-2"
          },
            listItems.map((item: any, itemIndex: number) => {
              // Handle different item types safely
              let itemText = '';
              
              if (typeof item === 'string') {
                itemText = item;
              } else if (typeof item === 'object' && item !== null) {
                // Handle nested objects in list items
                if (item.text) {
                  itemText = item.text;
                } else if (item.content) {
                  itemText = item.content;
                } else if (item.checked !== undefined) {
                  // Handle checklist items
                  itemText = item.text || item.content || '';
                } else {
                  // Fallback for other object types
                  itemText = JSON.stringify(item);
                }
              } else {
                itemText = String(item || '');
              }
              
              return (
                <li key={itemIndex} className="text-gray-700 leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(itemText) }}></span>
                </li>
              );
            })
          );
        case 'image':
          // Handle different image data structures
          let imageUrl = '';
          let imageCaption = '';
          
          if (block.data) {
            // Handle EditorJS image format
            if (block.data.file && block.data.file.url) {
              imageUrl = block.data.file.url;
              imageCaption = block.data.caption || '';
            }
            // Handle direct URL format
            else if (block.data.url) {
              imageUrl = block.data.url;
              imageCaption = block.data.caption || '';
            }
            // Handle legacy format
            else if (typeof block.data === 'string') {
              imageUrl = block.data;
            }
          }
          
          if (imageUrl) {
            return (
              <div key={block.id || `image-${index}`} className="my-6 flex flex-col items-center">
                <div className="relative w-full max-w-4xl">
                  <Image
                    src={imageUrl}
                    alt={imageCaption || 'Blog image'}
                    width={800}
                    height={600}
                    className="rounded-lg object-contain max-w-full h-auto shadow-sm"
                    style={{ objectFit: 'contain' }}
                    onError={(e) => {
                      console.warn('Image failed to load:', imageUrl);
                      // You could set a fallback image here
                    }}
                  />
                </div>
                {imageCaption && (
                  <p className="text-center text-sm text-gray-600 mt-2 italic">{imageCaption}</p>
                )}
              </div>
            );
          }
          
          console.warn("Image block is missing valid URL:", block.data);
          return (
            <div key={block.id || `image-error-${index}`} className="my-6 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-500 text-sm">[Image could not be loaded]</p>
            </div>
          );
        case 'warning':
          return (
            <div key={block.id || `warning-${index}`} className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
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
                    <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.data.message || '') }}></p>
                  </div>
                </div>
              </div>
            </div>
          );
        case 'checklist':
          const checklistItems = Array.isArray(block.data.items) ? block.data.items : [];
          return (
            <div key={block.id || `checklist-${index}`} className="my-4">
              <ul className="space-y-2">
                {checklistItems.map((item: any, itemIndex: number) => {
                  // Handle different item structures
                  let itemText = '';
                  let isChecked = false;
                  
                  if (typeof item === 'object' && item !== null) {
                    itemText = item.text || item.content || '';
                    isChecked = Boolean(item.checked);
                  } else if (typeof item === 'string') {
                    itemText = item;
                    isChecked = false;
                  } else {
                    itemText = String(item || '');
                    isChecked = false;
                  }
                  
                  return (
                    <li key={itemIndex} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className={`ml-3 text-sm ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {itemText}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        case 'quote':
          return (
            <blockquote key={block.id || `quote-${index}`} className="border-l-4 border-gray-300 pl-8 py-6 my-8 bg-gray-50 rounded-r-lg">
              <p className="text-gray-700 italic text-xl leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.data.text || '') }}></p>
              {block.data.caption && (
                <cite className="text-sm text-gray-600 mt-4 block font-medium">— {sanitizeHtml(block.data.caption)}</cite>
              )}
            </blockquote>
          );
        case 'delimiter':
          return (
            <div key={block.id || `delimiter-${index}`} className="my-8 flex justify-center">
              <div className="text-4xl text-gray-300">***</div>
            </div>
          );
        case 'code':
          return (
            <div key={block.id || `code-${index}`} className="my-8">
              <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed">
                <code>{block.data.code}</code>
              </pre>
            </div>
          );
        case 'embed':
          return (
            <div key={block.id || `embed-${index}`} className="my-6">
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
          const tableContent = Array.isArray(block.data.content) ? block.data.content : [];
          return (
            <div key={block.id || `table-${index}`} className="my-8 overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <tbody>
                  {tableContent.map((row: any, rowIndex: number) => {
                    // Handle different row formats
                    const rowData = Array.isArray(row) ? row : [];
                    
                    return (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {rowData.map((cell: any, cellIndex: number) => {
                          // Handle different cell formats
                          let cellContent = '';
                          
                          if (typeof cell === 'string') {
                            cellContent = cell;
                          } else if (typeof cell === 'object' && cell !== null) {
                            cellContent = cell.text || cell.content || JSON.stringify(cell);
                          } else {
                            cellContent = String(cell || '');
                          }
                          
                          return (
                            <td key={cellIndex} className="border border-gray-200 px-6 py-4 text-sm text-gray-700">
                              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(cellContent) }}></span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        case 'raw':
          return (
            <div key={block.id || `raw-${index}`} className="my-4">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.data.html || '') }} />
            </div>
          );
        default:
          console.warn("Unsupported block type:", block.type, "Block data:", block.data);
          return (
            <div key={block.id || `unsupported-${index}`} className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Unsupported content type:</strong> {block.type}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="text-xs text-yellow-600 cursor-pointer">Show block data</summary>
                  <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto">
                    {JSON.stringify(block.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          );
      }
    });
  } catch (e) {
    console.error("Failed to parse or render blog content:", e, "Input:", contentInput);
    if (typeof contentInput === 'string' && contentInput !== "[object Object]") {
       return <p>{contentInput}</p>;
    }
    return <p className="text-red-500">[Error processing content]</p>;
  }
};

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blogId, setBlogId] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setBlogId(resolvedParams.id);
    };
    
    initializeParams();
  }, [params]);
  
  useEffect(() => {
    if (!blogId) return;
    
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/blog/${blogId}`);
        
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
    
    fetchPost();
  }, [blogId]);
  
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
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight text-center">
          {post.title}
        </h1>

        {/* Article Meta */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100 overflow-x-auto">
          {post.category && (
            <div className="flex items-center flex-shrink-0">
              <span className="inline-block bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded-full text-xs font-medium">
                {post.category.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex items-center flex-shrink-0">
            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="font-medium text-xs sm:text-sm whitespace-nowrap">By {post.author.name}</span>
          </div>
          <div className="flex items-center flex-shrink-0">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="text-xs sm:text-sm whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center flex-shrink-0">
            <div className="w-1 h-1 bg-gray-300 rounded-full mr-1"></div>
            <span className="text-xs sm:text-sm whitespace-nowrap">5 Min Read</span>
          </div>
        </div>

        {/* Hero Image */}
        {post.coverImage && (
          <div className="mb-12">
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden rounded-lg">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg prose-gray max-w-none mb-16">
          {renderEditorJsContent(post.content)}
        </article>
        
        {/* Author Bio */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <RelatedPosts 
            currentPostId={blogId || ''} 
            category={post.category || ''} 
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}