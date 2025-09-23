'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, RefreshCw } from "lucide-react";

interface Metric {
  _id?: string;
  platform: string;
  metricType: string;
  value: number;
}

interface MetricInputState {
  [key: string]: string; // Store values as strings for input fields e.g., "Instagram-Followers": "1000"
}

const METRIC_DEFINITIONS = [
  { platform: 'Instagram', metricType: 'Followers' },
  { platform: 'Instagram', metricType: 'EngagementRate' },
  { platform: 'TikTok', metricType: 'Followers' },
  { platform: 'TikTok', metricType: 'TotalViews' },
  { platform: 'YouTube', metricType: 'Subscribers' },
  { platform: 'YouTube', metricType: 'TotalViews' }
];

export function SocialMetricsForm() {
  const [metrics, setMetrics] = useState<MetricInputState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  const generateKey = (platform: string, metricType: string) => `${platform}-${metricType}`;

  const fetchMetrics = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/admin/social-metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data: Metric[] = await response.json();
      const initialState: MetricInputState = {};
      METRIC_DEFINITIONS.forEach(def => {
        const key = generateKey(def.platform, def.metricType);
        const existing = data.find(m => m.platform === def.platform && m.metricType === def.metricType);
        initialState[key] = existing ? String(existing.value) : ''; // Initialize with fetched or empty string
      });
      setMetrics(initialState);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Error",
        description: "Could not load existing metrics.",
        variant: "destructive",
      });
      // Initialize with empty strings even on error
      const emptyState: MetricInputState = {};
       METRIC_DEFINITIONS.forEach(def => {
         emptyState[generateKey(def.platform, def.metricType)] = '';
       });
       setMetrics(emptyState);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch on initial mount

  const handleInputChange = (platform: string, metricType: string, value: string) => {
    const key = generateKey(platform, metricType);
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Show loading toast
    toast({
      title: "💾 Saving Metrics...",
      description: "Please wait while we save your social media metrics.",
      duration: 2000,
    });

    const payload = METRIC_DEFINITIONS
      .map(def => {
        const key = generateKey(def.platform, def.metricType);
        const value = metrics[key];
        if (!value || value.trim() === '') {
          return null; // Skip empty values
        }
        return {
          platform: def.platform,
          metricType: def.metricType,
          value: value,
        };
      })
      .filter(item => item !== null); // Remove null entries

    if (payload.length === 0) {
      toast({
        title: "⚠️ No Metrics to Save",
        description: "Please enter at least one metric value before saving.",
        variant: "destructive",
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    console.log("Sending metrics payload:", payload); // Debug log

    try {
      const response = await fetch('/api/admin/social-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save metrics');
      }

      toast({
        title: "✅ Metrics Saved Successfully!",
        description: "Your social media metrics have been updated and saved.",
        duration: 4000,
      });
      // Optionally re-fetch metrics after saving
      // fetchMetrics();
    } catch (error: any) {
      console.error("Error saving metrics:", error);
      toast({
        title: "❌ Failed to Save Metrics",
        description: error.message || "An unexpected error occurred while saving your metrics.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Social Media Metrics</CardTitle>
        <CardDescription>Enter the latest numbers for your social media profiles. These will be displayed publicly.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {isFetching ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading current metrics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {METRIC_DEFINITIONS.map(({ platform, metricType }) => {
                const key = generateKey(platform, metricType);
                const label = `${platform} ${metricType}`;
                // Add specific input types or hints if needed (e.g., '%' for rate)
                const placeholder = metricType.includes('Rate') ? "e.g., 2.5 for 2.5%" : "Enter number";
                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type="number" // Use number type for better input control
                      step={metricType.includes('Rate') ? "0.01" : "1"} // Allow decimals for rates
                      placeholder={placeholder}
                      value={metrics[key] ?? ''}
                      onChange={(e) => handleInputChange(platform, metricType, e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
           <Button type="button" variant="outline" onClick={fetchMetrics} disabled={isFetching || isLoading}>
             <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
           <Button type="submit" disabled={isLoading || isFetching}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isLoading ? 'Saving...' : 'Save Metrics'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 