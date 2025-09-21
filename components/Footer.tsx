'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram } from 'lucide-react'; // Assuming you might use other icons too
import { motion } from 'framer-motion';

// Animation variants for content fade-in
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Animation for floating shapes
const floatAnimation = {
  y: ["-8px", "8px"], // Movement range
  transition: {
    duration: 3, // Duration of one cycle
    repeat: Infinity, // Repeat forever
    repeatType: "reverse", // Go back and forth
    ease: "easeInOut", // Smooth easing
  }
};

export default function Footer() {
  return (
    <motion.footer
      className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white py-12 md:py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% is visible
    >
      {/* Animated Background Shapes */}
      <motion.div
        className="absolute top-10 left-5 w-16 h-16 bg-white/10 rounded-full filter blur-lg"
        animate={{ ...floatAnimation, x: ["-5px", "5px"], scale: [1, 1.1] }}
        transition={{ ...floatAnimation.transition, duration: 4 }}
      />
      <motion.div
        className="absolute bottom-5 right-10 w-20 h-20 bg-white/15 rounded-xl filter blur-md transform rotate-45"
        animate={{ ...floatAnimation, rotate: [30, 60] }}
        transition={{ ...floatAnimation.transition, duration: 5, delay: 0.5 }}
      />
       <motion.div
        className="absolute bottom-16 left-1/4 w-12 h-12 border-2 border-white/20 rounded-lg filter blur-sm"
        animate={{ ...floatAnimation, y: ["-12px", "12px"], rotate: [-20, 20] }}
        transition={{ ...floatAnimation.transition, duration: 3.5, delay: 0.2 }}
      />

      {/* Footer Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12"
          variants={fadeIn}
        >
          {/* Logo and Brand */}
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-3 mb-2">
              <Image
                src="/images/logo.jpeg" // Ensure this path is correct
                alt="QueensMeal Logo"
                width={45}
                height={45}
                className="h-11 w-auto rounded-full border-2 border-white/50 shadow-md"
              />
              <span className="text-2xl font-bold">
                QueensMeal
              </span>
            </div>
            <p className="text-green-100 mt-2 max-w-md text-sm">
              Your ultimate destination for culinary adventures and recipe discoveries.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center md:justify-end gap-8 md:gap-12 text-center md:text-left">
            <div>
              <h4 className="font-semibold mb-3 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-green-200 transition-colors">Home</Link></li>
                <li><Link href="/recipes" className="hover:text-green-200 transition-colors">Recipes</Link></li>
                <li><Link href="/blog" className="hover:text-green-200 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-lg">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-green-200 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-green-200 transition-colors">Contact</Link></li>
                {/* Add other relevant links */}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar: Copyright and Socials */}
        <motion.div
          className="border-t border-white/20 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm"
          variants={fadeIn}
        >
          <p className="text-green-100 mb-4 sm:mb-0">© {new Date().getFullYear()} QueensMeal. All rights reserved.</p>
          <div className="flex gap-5">
            {/* Replace # with actual social links */}
            <Link href="#" aria-label="Facebook" className="text-green-100 hover:text-white transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"> <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path> </svg>
            </Link>
            <Link href="#" aria-label="Instagram" className="text-green-100 hover:text-white transition-colors">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Twitter" className="text-green-100 hover:text-white transition-colors">
               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </Link>
             <Link href="#" aria-label="YouTube" className="text-green-100 hover:text-white transition-colors">
               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
} 