'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  Star, 
  Utensils,
  Instagram,
  Mail,
  Newspaper,
  ChevronDown,
  BarChart,
  LayoutDashboard,
  Film
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InstagramPostForm } from '@/components/admin/InstagramPostForm';
import { InstagramPostsList } from '@/components/admin/InstagramPostsList';
import { TikTokPostForm } from '@/components/admin/TikTokPostForm';
import { TikTokPostsList } from '@/components/admin/TikTokPostsList';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { NewsletterList } from '@/components/admin/NewsletterList';
import { SocialMetricsForm } from '@/components/admin/SocialMetricsForm';

const adminTabs = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "tiktok", label: "TikTok", icon: Film },
  { value: "featured", label: "Featured", icon: Star },
  { value: "blog", label: "Blog", icon: FileText },
  { value: "contacts", label: "Contacts", icon: Mail },
  { value: "newsletter", label: "Newsletter", icon: Newspaper },
  { value: "metrics", label: "Social Metrics", icon: BarChart },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState(adminTabs[0].value);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticate={() => setIsAuthenticated(true)} />;
  }
  
  const activeTabLabel = adminTabs.find(tab => tab.value === activeTab)?.label || "Select Tab";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <AdminHeader />
      
      <main className="max-w-8xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="relative mb-8 border-b border-gray-200">
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between mb-2">
                    {activeTabLabel}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                  {adminTabs.map((tab) => (
                    <DropdownMenuItem 
                      key={tab.value} 
                      onSelect={() => setActiveTab(tab.value)}
                      className={activeTab === tab.value ? "bg-accent" : ""}
                    >
                      {tab.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <TabsList className="flex overflow-x-auto space-x-1 pb-px -mb-px scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {adminTabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value} 
                    className="whitespace-nowrap px-3 sm:px-4 py-2"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}
          </div>
          
          {adminTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-8 mt-0">
              {tab.value === "instagram" && (
                <>
                  <InstagramPostForm />
                  <div key="instagram-posts-list"> <InstagramPostsList /> </div>
                </>
              )}
              {tab.value === "tiktok" && (
                 <>
                  <TikTokPostForm />
                  <TikTokPostsList />
                 </>
              )}
              {tab.value === "featured" && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6"> 
                    <h2 className="text-2xl font-bold">Featured Content</h2>
                    <Link href="/admin/featured">
                      <Button size="sm" className="flex items-center gap-2 w-full sm:w-auto"> 
                        <Star className="h-4 w-4 flex-shrink-0" /> 
                        <span className="hidden sm:inline">Manage Featured Content</span> 
                        <span className="sm:hidden">Manage</span> 
                      </Button>
                    </Link>
                  </div>
                  <p className="text-gray-600">Featured content appears prominently on the homepage. Click the button above to add, edit, or remove featured content.</p>
                </>
              )}
               {tab.value === "blog" && (
                 <>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6"> 
                    <h2 className="text-2xl font-bold">Blog Management</h2>
                    <Link href="/admin/blog">
                      <Button size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Manage Blog Posts</span>
                        <span className="sm:hidden">Manage</span>
                      </Button>
                    </Link>
                  </div>
                  <p className="text-gray-600">Create and manage blog posts for your cooking journal. Add articles, recipes, tips, and stories to engage your audience.</p>
                 </>
              )}
               {tab.value === "contacts" && (
                 <>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6"> 
                    <h2 className="text-2xl font-bold">Contact Management</h2>
                    <Link href="/admin/contact">
                      <Button size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline">View Contact Submissions</span>
                        <span className="sm:hidden">View Submissions</span>
                      </Button>
                    </Link>
                  </div>
                  <p className="text-gray-600">Manage contact form submissions and inquiries from your users. Respond to questions and feedback.</p>
                 </>
              )}
               {tab.value === "newsletter" && (
                 <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Newspaper className="h-6 w-6" />Newsletter Subscriptions</h2>
                  </div>
                  <NewsletterList />
                 </>
              )}
              {tab.value === "metrics" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart className="h-6 w-6" />Manage Social Metrics</h2>
                    <p className="text-gray-600 mt-1">Update the social media statistics displayed on your public website.</p>
                  </div>
                  <SocialMetricsForm />
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
} 