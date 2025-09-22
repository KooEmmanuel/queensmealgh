"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { TikTokFeed } from "@/components/TikTokFeed";
import { motion } from "framer-motion";

export default function PopularRecipesScroll() {
  const router = useRouter();

  const handleExploreAllRecipes = () => {
    router.push('/tiktok');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4">
        {/* Modern Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Trending Now
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-6">
            Popular Recipes
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-orange-500">
              Today
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 font-sourcesans max-w-2xl mx-auto leading-relaxed">
            Discover our most popular recipes, featuring authentic African cuisine and easy-to-follow instructions that bring the taste of home to your kitchen.
          </p>
        </motion.div>

        {/* Modern Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-white/60 rounded-3xl shadow-xl border border-white/20 backdrop-blur-sm"></div>
          
          {/* Content container */}
          <div className="relative p-6 md:p-8">
            <TikTokFeed />
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-2xl p-6 mb-6">
            <p className="text-gray-700 mb-4 font-sourcesans text-lg">
              🎉 <strong>New recipes added daily!</strong> Join thousands of food lovers discovering authentic African flavors.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Fresh content daily
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Step-by-step videos
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Traditional techniques
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 font-sourcesans">
            Want to see more amazing recipes?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExploreAllRecipes}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Explore All Recipes
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
} 