"use client"

import Image from "next/image";
// Remove Search import if no longer needed elsewhere
// import { Search } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2, MailCheck, AlertTriangle } from "lucide-react"; // Import icons

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);
  // State for newsletter form
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Detect mobile screen on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Basic email validation regex
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    if (!email || !validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address.", type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage({ text: data.message || 'Successfully subscribed!', type: 'success' });
      setEmail(""); // Clear input on success

    } catch (error: any) {
      setMessage({ text: error.message || 'Subscription failed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative py-8 md:py-20 overflow-hidden bg-gradient-to-br from-green-100 to-green-300 font-montserrat">
      {/* Background gradient and pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
      
      {/* Animated background elements - hide some on mobile */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="floating-circle bg-green-300 opacity-30 w-80 h-80 rounded-full absolute top-[5%] left-[10%] hidden md:block"></div>
        <div className="floating-circle-reverse bg-orange-200 opacity-30 w-64 h-64 rounded-full absolute top-[60%] left-[75%] hidden md:block"></div>
        <div className="floating-circle-slow bg-amber-100 opacity-40 w-48 h-48 rounded-full absolute top-[30%] left-[60%]"></div>
        <div className="floating-circle-slower bg-green-400 opacity-20 w-32 h-32 rounded-full absolute top-[70%] left-[20%]"></div>
        
        {/* Decorative shapes - hide on mobile */}
        <div className="absolute top-[20%] right-[10%] w-24 h-24 bg-orange-300 rounded-tl-3xl rounded-br-3xl opacity-20 rotate-shape hidden md:block"></div>
        <div className="absolute bottom-[15%] left-[15%] w-16 h-16 bg-green-500 rounded-tr-2xl rounded-bl-2xl opacity-20 rotate-shape-reverse hidden md:block"></div>
        
        {/* Animated food elements - adjusted for mobile */}
        <div className="food-float-left absolute top-[15%] left-[5%] hidden md:block">
          <div className="text-4xl transform rotate-12">🍚</div>
        </div>
        <div className="food-float-right absolute top-[25%] right-[5%] hidden md:block">
          <div className="text-4xl transform -rotate-12">🍗</div>
        </div>
        <div className="food-float-left-slow absolute top-[40%] left-[10%] hidden md:block">
          <div className="text-4xl transform rotate-6">🥘</div>
        </div>
        <div className="food-float-right-slow absolute top-[60%] right-[10%] hidden md:block">
          <div className="text-4xl transform -rotate-6">🍲</div>
        </div>
        <div className="food-float-left-slower absolute top-[75%] left-[15%] hidden md:block">
          <div className="text-4xl transform rotate-12">🥗</div>
        </div>
        <div className="food-float-diagonal absolute top-[10%] left-[30%] hidden md:block">
          <div className="text-3xl transform rotate-45">🌶️</div>
        </div>
        <div className="food-float-diagonal-reverse absolute top-[80%] right-[40%] hidden md:block">
          <div className="text-3xl transform -rotate-45">🍅</div>
        </div>
        
        {/* Mobile-specific food elements - fewer and positioned differently */}
        <div className="food-float-left-slow absolute top-[10%] left-[10%] md:hidden">
          <div className="text-3xl transform rotate-6">🥘</div>
        </div>
        <div className="food-float-right-slow absolute top-[15%] right-[10%] md:hidden">
          <div className="text-3xl transform -rotate-6">🍲</div>
        </div>
        <div className="food-float-diagonal absolute bottom-[20%] left-[15%] md:hidden">
          <div className="text-2xl transform rotate-45">🌶️</div>
        </div>
      </div>
      
      <div className="container relative mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row-reverse items-center justify-between md:gap-8 lg:gap-16 xl:gap-24">
          {/* Right content - added max-width for large screens */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0 text-center md:text-left z-10 fade-in-right lg:max-w-[45%] xl:max-w-[40%]">
            <div className="inline-block mb-2 bg-green-100 px-4 py-1 rounded-full border border-green-200 text-green-800 text-sm font-medium bounce-in">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 pulse-dot"></span>
                <span className="font-karla">Authentic African Cuisine</span>
              </span>
            </div>
            
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-green-900 tracking-tight">
              Welcome to <span className="text-gradient-green-orange">Queensmeal</span>
            </h1>
            
            <p className="font-sourcesans text-lg md:text-xl text-green-800 max-w-xl mx-auto md:mx-0 mb-6 md:mb-8 leading-relaxed slide-in-bottom">
              Discover authentic African recipes and culinary inspiration from our kitchen to yours. Join our newsletter for updates!
            </p>
            
            {/* Newsletter Signup Form */}
            <form onSubmit={handleSubscribe} className="w-full max-w-lg mx-auto md:mx-0 mb-4">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="rounded-r-none focus-visible:ring-orange-500 flex-grow"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required // Added basic HTML5 validation
                />
                <Button 
                  type="submit" 
                  className="rounded-l-none bg-orange-500 hover:bg-orange-600 w-32" // Fixed width for button
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Subscribe'}
                </Button>
              </div>
            </form>
            {/* Subscription Message Area */}
            {message && (
              <div className={`mt-3 text-sm flex items-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.type === 'success' ? <MailCheck className="h-4 w-4 mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                {message.text}
              </div>
            )}
          </div>
          
          {/* Left side - Person image with enhanced styling - adjusted width for large screens */}
          <div className="w-full md:w-1/2 lg:w-[55%] xl:w-[60%] relative fade-in-left">
            <div className="relative h-[300px] sm:h-[400px] md:h-[550px] lg:h-[600px] w-full">
              {/* Animated background for image - simplified for mobile */}
              <div className="absolute inset-0 bg-white rounded-full pulse-bg opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-amber-50 rounded-full opacity-40 rotate-bg"></div>
              <div className="absolute inset-0 border-4 md:border-8 border-dashed border-green-100 rounded-full opacity-60 rotate-bg-reverse"></div>
              
              {/* Bottom decorative platform - simplified for mobile */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80%] h-[10%] md:h-[15%] bg-gradient-to-r from-green-400/30 to-green-600/30 rounded-t-[50%] blur-sm"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[70%] h-[3%] md:h-[5%] bg-green-700/20 rounded-t-[50%]"></div>
              
              {/* Subtle shadow beneath */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-[2%] md:h-[3%] bg-black/10 rounded-full blur-md"></div>
              
              {/* Decorative dots at bottom - hide some on mobile */}
              <div className="absolute bottom-[5%] left-[30%] w-2 h-2 bg-green-500 rounded-full animate-ping-slow hidden sm:block"></div>
              <div className="absolute bottom-[7%] left-[40%] w-3 h-3 bg-amber-400 rounded-full animate-ping-slow delay-300"></div>
              <div className="absolute bottom-[4%] left-[60%] w-2 h-2 bg-green-600 rounded-full animate-ping-slow delay-700 hidden sm:block"></div>
              
              {/* Main image */}
              <Image
                src="/images/person.png" 
                alt="Chef with African cuisine"
                fill
                priority
                className="object-contain z-10 hover-scale"
                style={{
                  objectPosition: 'center'
                }}
              />
              
              {/* Decorative elements - simplified for mobile */}
              <div className="absolute -bottom-5 -left-5 md:-bottom-10 md:-left-10 w-20 md:w-40 h-20 md:h-40 bg-orange-200 rounded-full opacity-50 blur-md floating-circle-slow"></div>
              <div className="absolute top-10 right-5 md:top-20 md:right-10 w-10 md:w-20 h-10 md:h-20 bg-green-300 rounded-full opacity-40 blur-sm floating-circle"></div>
              
              {/* New animated food elements around the chef - keep one for mobile */}
              <div className="absolute top-[20%] right-[15%] food-orbit z-20 hidden md:block">
                <div className="text-3xl">🍛</div>
              </div>
              <div className="absolute bottom-[30%] left-[10%] food-orbit-reverse z-20">
                <div className="text-2xl md:text-3xl">🥑</div>
              </div>
            </div>
            
            {/* Floating badge - adjusted for mobile */}
            <div className="absolute top-5 md:top-10 left-5 md:left-10 bg-white rounded-full shadow-lg px-3 py-2 md:px-5 md:py-3 flex items-center z-20 hover-lift bounce-in-delay">
              <span className="text-green-600 text-sm md:text-base font-karla font-bold">Authentic Recipes</span>
            </div>
            
            {/* Additional floating elements - hide on small mobile */}
            <div className="absolute bottom-10 md:bottom-20 right-0 bg-white rounded-lg shadow-xl p-3 md:p-4 flex items-center gap-2 md:gap-3 z-20 transform -translate-x-1/4 md:translate-x-0 hover-lift slide-in-right hidden sm:flex">
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-green-100 flex items-center justify-center text-xl md:text-2xl">
                🍲
              </div>
              <div>
                <p className="font-karla font-semibold text-gray-900 text-sm md:text-base">African Cuisine</p>
                <p className="font-sourcesans text-xs md:text-sm text-gray-500">Traditional flavors</p>
              </div>
            </div>
            
            {/* New floating element - Recipe count - adjusted for mobile */}
            <div className="absolute top-1/2 -left-2 md:-left-5 bg-green-600 text-white rounded-lg shadow-xl p-2 md:p-3 flex flex-col items-center z-20 hover-lift-strong slide-in-left">
              <span className="font-montserrat text-xl md:text-2xl font-bold">100+</span>
              <span className="font-karla text-[10px] md:text-xs">Recipes</span>
            </div>
            
            {/* New floating element - Star rating - adjusted for mobile */}
            <div className="absolute top-1/3 right-0 bg-amber-400 text-white rounded-full shadow-xl p-2 md:p-3 flex items-center gap-1 z-20 hover-rotate slide-in-right-delay">
              <span className="text-base md:text-lg">⭐</span>
              <span className="font-montserrat text-sm md:text-base font-bold">4.9</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Curved bottom edge */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="fill-white">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
        </svg>
      </div>
    </section>
  );
} 