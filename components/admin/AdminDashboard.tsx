"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Mail, 
  FileText, 
  TrendingUp, 
  Instagram, 
  Film, 
  Star,
  DollarSign,
  Activity,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalSubscribers: number;
  totalContacts: number;
  totalBlogPosts: number;
  totalInstagramPosts: number;
  totalTikTokPosts: number;
  totalFeatured: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalSubscribers: 0,
    totalContacts: 0,
    totalBlogPosts: 0,
    totalInstagramPosts: 0,
    totalTikTokPosts: 0,
    totalFeatured: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/dashboard-stats');
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }
      
      const data = await response.json();
      
      setStats({
        totalSubscribers: data.totalSubscribers || 0,
        totalContacts: data.totalContacts || 0,
        totalBlogPosts: data.totalBlogPosts || 0,
        totalInstagramPosts: data.totalInstagramPosts || 0,
        totalTikTokPosts: data.totalTikTokVideos || 0,
        totalFeatured: data.totalFeaturedContent || 0,
        totalRevenue: data.totalRevenue || 0,
        monthlyGrowth: data.monthlyGrowth || 0
      });

      // Set recent activity if available
      if (data.recentActivity) {
        setRecentActivities(data.recentActivity);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Newsletter Subscribers",
      value: stats.totalSubscribers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Contact Submissions",
      value: stats.totalContacts,
      icon: Mail,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Blog Posts",
      value: stats.totalBlogPosts,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Instagram Posts",
      value: stats.totalInstagramPosts,
      icon: Instagram,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "TikTok Videos",
      value: stats.totalTikTokPosts,
      icon: Film,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Featured Content",
      value: stats.totalFeatured,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Total Revenue",
      value: `GHC ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Monthly Growth",
      value: `${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Welcome to Queens Meal Admin</h1>
        <p className="text-green-100 text-sm sm:text-base">Manage your content, track performance, and grow your community.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and activities in your admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-gray-50">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-2">
                <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
                <span className="text-xs sm:text-sm text-center">New Instagram Post</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-2">
                <Film className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                <span className="text-xs sm:text-sm text-center">New TikTok Video</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-2">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                <span className="text-xs sm:text-sm text-center">New Blog Post</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-2">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                <span className="text-xs sm:text-sm text-center">Feature Content</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}