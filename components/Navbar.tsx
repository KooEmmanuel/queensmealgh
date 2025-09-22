'use client'; // Add this if using client-side hooks or event handlers

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
// Import useState and useEffect if you plan to add dynamic behavior later
// import { useState, useEffect } from 'react'; 

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2"> {/* Make logo clickable */}
              <Image 
                src="/images/logo.jpeg" 
                alt="Queensmeal Logo" 
                width={50} 
                height={50}
                className="rounded-full"
              />
              <span className="text-2xl font-bold">
                Queens<span className="text-orange-500">meal</span>
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="/" className="font-medium text-black hover:text-orange-500 transition-colors">
              HOME
            </Link>
            <Link href="/about" className="font-medium text-gray-600 hover:text-orange-500 transition-colors">
              ABOUT
            </Link>
            <Link href="/recipes" className="font-medium text-gray-600 hover:text-orange-500 transition-colors">
              RECIPES
            </Link>
            <Link href="/blog" className="font-medium text-gray-600 hover:text-orange-500 transition-colors">
              BLOG
            </Link>
            <Link href="/tiktok" className="font-medium text-gray-600 hover:text-orange-500 transition-colors">
              TIKTOK
            </Link>
            <Link href="/contact" className="font-medium text-gray-600 hover:text-orange-500 transition-colors">
              CONTACT
            </Link>

          </nav>
          <div className="flex items-center">
            <div className="md:hidden">
              <Button onClick={toggleMobileMenu} variant="ghost" size="icon">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-md md:hidden z-40">
          <nav className="flex flex-col items-center gap-4 p-4">
            <Link href="/" className="font-medium text-black hover:text-orange-500 transition-colors" onClick={toggleMobileMenu}>
              HOME
            </Link>
            <Link href="/about" className="font-medium text-gray-600 hover:text-orange-500 transition-colors" onClick={toggleMobileMenu}>
              ABOUT
            </Link>
            <Link href="/recipes" className="font-medium text-gray-600 hover:text-orange-500 transition-colors" onClick={toggleMobileMenu}>
              RECIPES
            </Link>
            <Link href="/blog" className="font-medium text-gray-600 hover:text-orange-500 transition-colors" onClick={toggleMobileMenu}>
              BLOG
            </Link>
            <Link href="/tiktok" className="font-medium text-gray-600 hover:text-orange-500 transition-colors" onClick={toggleMobileMenu}>
              TIKTOK
            </Link>
            <Link href="/contact" className="font-medium text-gray-600 hover:text-orange-500 transition-colors" onClick={toggleMobileMenu}>
              CONTACT
            </Link>
            <Link href="/admin" className="font-medium text-gray-600 hover:text-orange-500 transition-colors" onClick={toggleMobileMenu}>
              ADMIN
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
} 