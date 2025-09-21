'use client';

import { useState, useEffect } from 'react';
import { Instagram, Youtube } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from 'framer-motion'; // Import motion

// Define the structure for fetched metrics data
interface FetchedMetricsData {
  [platform: string]: {
    [metricType: string]: number;
  };
}

// Define the structure for processed metrics to display
interface DisplayMetric {
  platform: string;
  icon: React.ReactNode;
  value: number | null; // Allow null for loading state
  label: string;
}

// Helper function to format large numbers
const formatNumber = (num: number | null): string => {
  if (num === null) return '-';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Animation variants for the container and items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger animation of children
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export function SocialMetricsSection() {
  const [metrics, setMetrics] = useState<FetchedMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/social-metrics'); // Public API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FetchedMetricsData = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch social metrics:", err);
        setError("Couldn't load social stats.");
        setMetrics(null); // Clear metrics on error
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Prepare data for display
  const displayMetrics: DisplayMetric[] = [
    { platform: 'Instagram', icon: <Instagram className="h-8 w-8 text-pink-500" />, value: metrics?.Instagram?.Followers ?? null, label: 'Followers' },
    { platform: 'TikTok', icon: <FaTiktok className="h-8 w-8 text-black dark:text-white" />, value: metrics?.TikTok?.Followers ?? null, label: 'Followers' },
    { platform: 'YouTube', icon: <Youtube className="h-8 w-8 text-red-600" />, value: metrics?.YouTube?.Subscribers ?? null, label: 'Subscribers' },
    // Add more metrics if needed, e.g., YouTube Views
    // { platform: 'YouTube', icon: <Youtube className="h-8 w-8 text-red-600" />, value: metrics?.YouTube?.TotalViews ?? null, label: 'Total Views' },
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-green-900/30">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
          Join Our Community
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Connect with us and thousands of food lovers across your favorite platforms!
        </p>

        {loading ? (
          // Loading Skeletons
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          // Error Message
          <div className="text-red-500 dark:text-red-400">{error}</div>
        ) : (
          // Display Metrics with Animation
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible" // Use whileInView for scroll-triggered animation: initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          >
            {displayMetrics.map((metric) => (
              <motion.div
                key={`${metric.platform}-${metric.label}`}
                className="flex flex-col items-center text-center p-4 rounded-lg transition-transform duration-300 ease-out"
                variants={itemVariants}
                whileHover={{ scale: 1.08, y: -5 }} // Hover animation
              >
                <div className="mb-3">{metric.icon}</div>
                <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(metric.value)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                  {metric.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
} 