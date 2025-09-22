"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Eye, 
  Send, 
  Calendar,
  Users,
  Mail,
  TrendingUp,
  Clock,
  FileText,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { EmailTemplate } from '@/components/EmailTemplate';

interface Newsletter {
  _id: string;
  subject: string;
  previewText: string;
  content: any;
  tags: string[];
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  sentAt?: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
}

export function NewsletterList() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchNewsletters();
  }, [statusFilter]);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/newsletter/save?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setNewsletters(data.newsletters);
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      toast.error('Failed to fetch newsletters');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) {
      return;
    }

    try {
      const response = await fetch(`/api/newsletter/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Newsletter deleted successfully');
        fetchNewsletters();
      } else {
        toast.error(data.error || 'Failed to delete newsletter');
      }
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      toast.error('Failed to delete newsletter');
    }
  };

  const openPreview = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setIsPreviewOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNewsletters = newsletters.filter(newsletter => {
    const matchesSearch = searchTerm === '' || 
      newsletter.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.previewText.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading newsletters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search newsletters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Newsletters List */}
      {filteredNewsletters.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No newsletters found</h3>
            <p className="text-gray-500">Create your first newsletter using the generator on the left.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNewsletters.map((newsletter) => (
            <Card key={newsletter._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {newsletter.subject}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {newsletter.previewText}
                        </p>
                      </div>
                      <Badge className={`ml-4 ${getStatusBadgeClass(newsletter.status)}`}>
                        {newsletter.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(newsletter.createdAt).toLocaleDateString()}
                      </div>
                      
                      {newsletter.status === 'sent' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {newsletter.recipientCount} sent
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {newsletter.openCount} opens
                          </div>
                        </>
                      )}
                      
                      {newsletter.tags && newsletter.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {newsletter.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                          {newsletter.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{newsletter.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    <div className="text-right text-sm text-gray-500">
                      {newsletter.status === 'sent' && newsletter.sentAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Sent {new Date(newsletter.sentAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPreview(newsletter)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {newsletter.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNewsletter(newsletter._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Newsletter Preview</DialogTitle>
          </DialogHeader>
          
          {selectedNewsletter && (
            <div className="mt-4">
              <EmailTemplate content={selectedNewsletter} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}