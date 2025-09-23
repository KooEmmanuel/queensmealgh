'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, Users, Mail, Calendar, Download, RefreshCw } from "lucide-react";

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  status: string;
  subscribedAt: string;
  source?: string;
}

export function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/newsletter/subscribers');
      const data = await response.json();
      
      if (data.success) {
        setSubscribers(data.subscribers);
        setFilteredSubscribers(data.subscribers);
      } else {
        throw new Error(data.error || 'Failed to fetch subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscribers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    let filtered = subscribers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    setFilteredSubscribers(filtered);
  }, [subscribers, searchTerm, statusFilter]);

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Name', 'Status', 'Subscribed At', 'Source'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.status,
        new Date(sub.subscribedAt).toLocaleDateString(),
        sub.source || 'website'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredSubscribers.length} subscribers to CSV`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'unsubscribed':
        return 'bg-red-100 text-red-800';
      case 'bounced':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Newsletter Subscribers
          </CardTitle>
          <CardDescription>
            Manage your newsletter subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading subscribers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Newsletter Subscribers ({filteredSubscribers.length})
            </CardTitle>
            <CardDescription>
              Manage your newsletter subscribers
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubscribers}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportSubscribers}
              disabled={filteredSubscribers.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search subscribers by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>

        {/* Subscribers List */}
        {filteredSubscribers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No subscribers found</p>
            <p className="text-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Subscribers will appear here once people sign up for your newsletter'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {subscriber.email}
                    </p>
                    {subscriber.name && (
                      <p className="text-sm text-gray-500 truncate">
                        {subscriber.name}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(subscriber.status)}>
                        {subscriber.status}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(subscriber.subscribedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {subscriber.source || 'website'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {subscribers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
                <p className="text-sm text-gray-500">Total Subscribers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {subscribers.filter(s => s.status === 'active').length}
                </p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {subscribers.filter(s => s.status === 'unsubscribed').length}
                </p>
                <p className="text-sm text-gray-500">Unsubscribed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {subscribers.filter(s => s.status === 'bounced').length}
                </p>
                <p className="text-sm text-gray-500">Bounced</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}