'use client';

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, ChevronLeft, Heart, Play, ArrowRight, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import HeroSection from "@/components/HeroSection"
import InstagramFollowSection from '@/components/InstagramFollowSection'
import { useState, useEffect } from 'react';
import ContactForm from '@/components/ContactForm';
import BlogPreviewCard from '@/components/BlogPreviewCard';
import { BlogPost } from '@/types/blog-post';
import PopularRecipesScroll from "@/components/PopularRecipesScroll";
import { SocialMetricsSection } from "@/components/SocialMetricsSection"
import Footer from '@/components/Footer';
import ServicesSection from '@/components/ServicesSection';

interface FeaturedContent {
  _id: string;
  title: string;
  description: string;
  imageBase64: string;
}

function FeaturedSection() {
  const [featured, setFeatured] = useState<FeaturedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/featured');
        
        if (!response.ok) {
          if (response.status === 404) {
            // No featured content yet
            setFeatured(null);
            return;
          }
          throw new Error('Failed to fetch featured content');
        }
        
        const data = await response.json();
        setFeatured(data);
      } catch (err) {
        console.error('Error fetching featured content:', err);
        setError('Could not load featured content');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-orange-500 font-semibold">FEATURED</span>
        </div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
      </section>
    );
  }

  if (error || !featured) {
    return (
      <section className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-orange-500 font-semibold">FEATURED</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="col-span-1">
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">No featured content available</p>
            </div>
          </div>
          <div className="col-span-2 space-y-4">
            <h3 className="text-2xl font-bold">Featured Recipe Coming Soon</h3>
            <p className="text-gray-600">
              Our team is working on bringing you the best recipes. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-orange-500 font-semibold">FEATURED</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="col-span-1">
          <Image
            src={featured.imageBase64}
            alt={featured.title}
            width={300}
            height={300}
            className="rounded-lg object-cover w-full h-64"
          />
        </div>
        <div className="col-span-2 space-y-4">
          <h3 className="text-2xl font-bold">{featured.title}</h3>
          {featured.description && (
            <p className="text-gray-600">{featured.description}</p>
          )}
          <div className="flex items-center gap-4">
            <Link href={`/recipes/${featured._id}`}>
              <Button className="rounded-full flex items-center gap-2">
                <Play className="h-4 w-4" /> See Recipe
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CookingJournalSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/blog/all');
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data: any = await response.json();

        let fetchedPosts: BlogPost[] = [];
        if (data && typeof data === 'object' && Array.isArray(data.posts)) {
          fetchedPosts = data.posts;
        } else if (Array.isArray(data)) {
          fetchedPosts = data;
        }

        setPosts(fetchedPosts.slice(0, 3));

      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Could not load blog posts.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <section className="container mx-auto px-4 md:px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">
          Cooking <span className="text-green-500">Journal</span>
        </h2>
        <Link href="/blog">
          <Button variant="outline" className="rounded-full">
            See All Articles
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-48 w-full bg-gray-200"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No articles available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogPreviewCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <HeroSection />

      {/* Contact Form */}
      <ContactForm />

      {/* Popular Recipes Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <PopularRecipesScroll />
      </section>

      {/* Instagram Follow Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Connect With Us</h2>
          <InstagramFollowSection />
        </div>
      </section>
  {/* ADD Services Section here */}
  <ServicesSection />
      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left space-y-3">
            <div className="flex justify-center md:justify-start">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600">🔍</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold">User-Centered</h3>
            <p className="text-gray-600 text-sm">
              Your feedback shapes our platform, ensuring a seamless and satisfying culinary journey.
            </p>
          </div>
          <div className="text-center md:text-left space-y-3">
            <div className="flex justify-center md:justify-start">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600">🌍</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Diverse Recipes</h3>
            <p className="text-gray-600 text-sm">
              We celebrate diverse culinary traditions from around the world, inspiring you today.
            </p>
          </div>
          <div className="text-center md:text-left space-y-3">
            <div className="flex justify-center md:justify-start">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600">👨‍👩‍👧‍👦</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Fun Community</h3>
            <p className="text-gray-600 text-sm">
              We foster a vibrant foodie community where joy comes with sharing recipes with us.
            </p>
            <div className="pt-2">
              <Link href="/community">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Join Our Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipe */}
      <FeaturedSection />

      {/* Community Section */}
      <section className="container mx-auto px-4 md:px-6 py-12 bg-orange-500 rounded-lg text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Don't Diet <br />
              Just Cooking!
            </h2>
            <p className="text-orange-100 mb-4">
              Discover our collection of delicious recipes that make healthy eating enjoyable. 
              No strict diets, just good food made with fresh ingredients.
            </p>
            <Link href="/recipes">
              <Button className="rounded-full bg-white text-orange-600 hover:bg-orange-100">
                Explore Recipes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div>
            <Image
              src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="Healthy cooking ingredients"
              width={600}
              height={400}
              className="rounded-lg object-cover shadow-md"
            />
          </div>
        </div>
      </section>

    

      {/* Cooking Journal Section */}
      <CookingJournalSection />
      <SocialMetricsSection />

      <Footer />
    </div>
  )
}
