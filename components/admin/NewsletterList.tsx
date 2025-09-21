'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Subscription {
  _id: string;
  email: string;
  subscribedAt: string; // Store as string after fetching
}

export function NewsletterList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/newsletter'); // Use the new admin API route
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch subscriptions');
        }
        const data: Subscription[] = await response.json();
        setSubscriptions(data);
      } catch (err: any) {
        console.error("Error fetching newsletter subscriptions:", err);
        setError(err.message || 'Could not load subscriptions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2">Loading Subscriptions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10 text-red-600">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return <p className="text-center text-gray-500 py-10">No newsletter subscriptions yet.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Newsletter Subscribers ({subscriptions.length})</h3>
      <ScrollArea className="h-[400px] border rounded-md"> {/* Added ScrollArea */}
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50 z-10"> {/* Sticky header */}
            <TableRow>
              <TableHead className="w-[60%]">Email Address</TableHead>
              <TableHead>Subscribed On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub._id}>
                <TableCell className="font-medium">{sub.email}</TableCell>
                <TableCell>{new Date(sub.subscribedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
} 