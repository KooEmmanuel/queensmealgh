'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Heart, 
  Users, 
  Target, 
  Award, 
  ChefHat, 
  Globe, 
  Star, 
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Footer from '@/components/Footer';

interface Statistics {
  recipes: number;
  communityMembers: number;
  countries: number;
  totalViews: number;
  tiktokPosts: number;
  blogPosts: number;
  lastUpdated: string;
}

export default function AboutPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/statistics');
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Could not load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const teamMembers = [
    {
      name: "Chef Sarah Mensah",
      role: "Founder & Head Chef",
      image: "/images/person.png",
      bio: "Passionate about bringing authentic African flavors to the world, Chef Sarah has over 15 years of culinary experience.",
      specialties: ["African Cuisine", "Traditional Recipes", "Food Innovation"]
    },
    {
      name: "Kwame Asante",
      role: "Content Director",
      image: "/images/person.png",
      bio: "Creative storyteller who brings our recipes to life through engaging content and beautiful visuals.",
      specialties: ["Content Creation", "Food Photography", "Social Media"]
    },
    {
      name: "Ama Osei",
      role: "Community Manager",
      image: "/images/person.png",
      bio: "Building connections and fostering a vibrant community of food lovers and home cooks.",
      specialties: ["Community Building", "Customer Relations", "Event Planning"]
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Authenticity",
      description: "We preserve and celebrate the authentic flavors and traditions of African cuisine, ensuring every recipe tells a story."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a global community of food lovers who share, learn, and grow together through the love of cooking."
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Committed to providing the highest quality recipes, content, and experiences for our community."
    },
    {
      icon: Globe,
      title: "Cultural Heritage",
      description: "Honoring and sharing the rich culinary heritage of Africa while embracing modern cooking techniques."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Queens Meal Founded",
      description: "Started as a passion project to share authentic African recipes with the world."
    },
    {
      year: "2021",
      title: "10K Followers",
      description: "Reached our first major milestone with a growing community of food enthusiasts."
    },
    {
      year: "2022",
      title: "Recipe Platform Launch",
      description: "Launched our comprehensive recipe platform with step-by-step cooking guides."
    },
    {
      year: "2023",
      title: "100K+ Community",
      description: "Built a thriving community of over 100,000 food lovers across social media platforms."
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded our reach globally, bringing African cuisine to kitchens worldwide."
    }
  ];

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`;
    } else {
      return `${num}+`;
    }
  };

  const stats = statistics ? [
    { number: formatNumber(statistics.recipes), label: "Authentic Recipes" },
    { number: formatNumber(statistics.communityMembers), label: "Community Members" },
    { number: statistics.countries > 0 ? `${statistics.countries}+` : "Coming Soon", label: "Countries Reached" },
    { number: formatNumber(statistics.totalViews), label: "Recipe Views" }
  ] : [
    { number: "Loading...", label: "Authentic Recipes" },
    { number: "Loading...", label: "Community Members" },
    { number: "Loading...", label: "Countries Reached" },
    { number: "Loading...", label: "Recipe Views" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-green-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
                <ChefHat className="w-4 h-4 mr-2" />
                About Queens Meal
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Bringing <span className="text-orange-500">African Flavors</span> to Your Kitchen
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're passionate about preserving and sharing the rich culinary heritage of Africa, 
                making authentic recipes accessible to home cooks worldwide while building a vibrant 
                community of food lovers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Explore Our Recipes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Join Our Community
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Queens Meal was born from a simple yet powerful vision: to make authentic African cuisine 
                    accessible to everyone, everywhere. Founded in 2020 by Chef Sarah Mensah, our journey began 
                    as a passion project to preserve and share the rich culinary traditions passed down through 
                    generations.
                  </p>
                  <p>
                    What started as sharing family recipes on social media has grown into a global movement, 
                    connecting food lovers across continents through the universal language of delicious, 
                    authentic cooking. We believe that food is more than sustenance—it's culture, heritage, 
                    and connection.
                  </p>
                  <p>
                    Today, we're proud to be a trusted source for authentic African recipes, cooking techniques, 
                    and culinary inspiration, serving a community of over 100,000 passionate home cooks and 
                    food enthusiasts worldwide.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/placeholder.jpg"
                    alt="Chef preparing traditional African dish"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-sm font-medium">Chef Sarah in her kitchen</p>
                    <p className="text-xs opacity-90">Creating authentic African flavors</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Mission & Vision
            </h2>
            <p className="text-xl text-gray-600">
              We're on a mission to celebrate and share the incredible diversity of African cuisine
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    To preserve, celebrate, and share the authentic flavors and culinary traditions of Africa, 
                    making them accessible to home cooks worldwide while fostering a global community united 
                    by the love of good food and cultural appreciation.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    To become the world's leading platform for authentic African cuisine, where every recipe 
                    tells a story, every dish connects cultures, and every meal brings people together in 
                    celebration of our shared humanity through food.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <value.icon className="w-8 h-8 text-orange-500" />
                      </div>
                      <CardTitle className="text-xl text-gray-900">
                        {value.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600">
                The passionate people behind Queens Meal
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-xl text-gray-900">
                        {member.name}
                      </CardTitle>
                      <CardDescription className="text-orange-500 font-medium">
                        {member.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {member.bio}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {member.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Journey
              </h2>
              <p className="text-xl text-gray-600">
                Key milestones in our growth and impact
              </p>
            </div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="flex-1">
                    <Card className={`${index % 2 === 0 ? 'mr-8' : 'ml-8'} hover:shadow-lg transition-shadow`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            {milestone.year}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {milestone.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                What Our Community Says
              </h2>
              <p className="text-xl text-gray-600">
                Stories from our amazing community members
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Queens Meal has transformed my cooking! The recipes are authentic, easy to follow, and absolutely delicious. My family loves every dish I make from your collection.",
                  author: "Maria Rodriguez",
                  location: "New York, USA"
                },
                {
                  quote: "As someone who moved away from home, Queens Meal helps me stay connected to my roots through food. The community is amazing and the recipes are spot-on.",
                  author: "Kwame Boateng",
                  location: "London, UK"
                },
                {
                  quote: "I've learned so much about African cuisine through Queens Meal. The step-by-step guides and cultural context make cooking these dishes so much more meaningful.",
                  author: "Sarah Johnson",
                  location: "Melbourne, Australia"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Quote className="w-8 h-8 text-orange-500 mb-4" />
                      <p className="text-gray-600 leading-relaxed mb-6">
                        "{testimonial.quote}"
                      </p>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.location}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-green-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Join Our Culinary Journey
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Be part of our growing community of food lovers and discover the incredible world of African cuisine
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-orange-500 hover:bg-gray-100">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Start Cooking Today
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500">
                  <Users className="w-4 h-4 mr-2" />
                  Join Our Community
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-gray-600">
                We'd love to hear from you and answer any questions you might have
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600">hello@queensmeal.com</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Follow Us</h3>
                <p className="text-gray-600">@queens_meal</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
                <p className="text-gray-600">Within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}