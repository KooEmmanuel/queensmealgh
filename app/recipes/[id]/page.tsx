'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Recipe {
  _id: string;
  title: string;
  description: string;
  imageBase64: string;
  ingredients: string[];
  instructions: string[];
  createdAt: string;
}

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/featured/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipe');
        }
        
        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Could not load recipe');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchRecipe();
    }
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse mb-6" />
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-8" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !recipe) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <p className="text-red-500 text-lg mb-4">{error || 'Recipe not found'}</p>
        <Link href="/recipes">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[40vh] md:h-[50vh]">
        <Image
          src={recipe.imageBase64}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <Link href="/recipes">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              30 mins
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Serves 4
            </span>
            <span>
              {new Date(recipe.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 mb-6">{recipe.description}</p>
            
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{ingredient}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-2xl font-bold mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex"
                  >
                    <span className="bg-orange-100 text-orange-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/recipes">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Recipes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 