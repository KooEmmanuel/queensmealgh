"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { TikTokFeed } from "@/components/TikTokFeed";

export default function PopularRecipesScroll() {
  return (
    // Removed outer flex container, let the section handle layout
    <ContainerScroll
      titleComponent={
        <>
          {/* Using existing styles/fonts from the page */}
          <h2 className="text-3xl font-bold text-center mb-4 font-playfair text-black dark:text-white">
            Popular Recipes Today
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 md:mb-12 font-sourcesans max-w-2xl mx-auto">
            Discover our most popular recipes, featuring authentic African cuisine and easy-to-follow instructions.
          </p>
        </>
      }
    >
      {/* Render TikTokFeed inside the scrolling card */}
      <div className="p-2 md:p-4 h-full overflow-y-auto"> {/* Add padding and allow vertical scroll if needed */}
        <TikTokFeed />
      </div>
    </ContainerScroll>
  );
} 