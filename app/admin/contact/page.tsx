'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Mail, Phone, Calendar, Check, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  type: string;
  createdAt: string;
  status: 'new' | 'in-progress' | 'completed' | 'archived';
}

export default function ContactManagementPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();
  
  useEffect(() => {
    fetchSubmissions();
  }, []);
  
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact submissions');
      }
      
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load contact submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub._id === id ? { ...sub, status: status as any } : sub
        )
      );
      
      if (selectedSubmission && selectedSubmission._id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: status as any });
      }
      
      toast({
        title: "Status Updated",
        description: `Submission marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };
  
  const viewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);
  };
  
  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesType = typeFilter === 'all' || sub.type === typeFilter;
    return matchesStatus && matchesType;
  });
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-purple-100 text-purple-800';
      case 'recipe':
        return 'bg-pink-100 text-pink-800';
      case 'collaboration':
        return 'bg-indigo-100 text-indigo-800';
      case 'feedback':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <div className="mb-4 sm:mb-8">
        <Link href="/admin" className="flex items-center text-gray-600 hover:text-orange-500">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm sm:text-base">Back to Admin</span>
        </Link>
      </div>
      
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Contact Form Submissions</h1>
      
      <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 sm:mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchSubmissions}
              className="flex items-center gap-1 h-8"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Refresh</span>
            </Button>
            <span className="text-xs sm:text-sm text-gray-500">
              {filteredSubmissions.length} submissions
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-medium">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] h-8">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-medium">Type:</span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-8">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="recipe">Recipe Request</SelectItem>
                  <SelectItem value="collaboration">Brand Collaboration</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <svg className="animate-spin h-8 w-8 mx-auto text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-500 text-sm">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">No contact submissions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.name}</div>
                          <div className="text-sm text-gray-500">{submission.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{submission.subject}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeClass(submission.type)}`}>
                          {submission.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(submission.status)}`}>
                          {submission.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => viewSubmission(submission)}
                            className="h-8"
                          >
                            <span className="text-xs">View</span>
                          </Button>
                          <Select 
                            value={submission.status} 
                            onValueChange={(value) => handleStatusChange(submission._id, value)}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredSubmissions.map((submission) => (
                <div key={submission._id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">{submission.subject}</h3>
                      <p className="text-xs text-gray-500 mt-1">{submission.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{submission.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(submission.status)}`}>
                        {submission.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeClass(submission.type)}`}>
                        {submission.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => viewSubmission(submission)}
                        className="h-8 px-3"
                      >
                        <span className="text-xs">View</span>
                      </Button>
                      <Select 
                        value={submission.status} 
                        onValueChange={(value) => handleStatusChange(submission._id, value)}
                      >
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedSubmission && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold">
                {selectedSubmission.subject}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Submitted on {new Date(selectedSubmission.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeClass(selectedSubmission.type)}`}>
                  {selectedSubmission.type}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-gray-600">
                  <span className="font-medium text-sm">From:</span>
                  <span className="text-sm">{selectedSubmission.name}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-gray-600">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:underline text-sm break-all">
                    {selectedSubmission.email}
                  </a>
                </div>
                
                {selectedSubmission.phone && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-gray-600">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <a href={`tel:${selectedSubmission.phone}`} className="text-blue-600 hover:underline text-sm">
                      {selectedSubmission.phone}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2 text-sm sm:text-base">Message:</h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{selectedSubmission.message}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between pt-4 border-t gap-3 sm:gap-0">
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusChange(selectedSubmission._id, 'completed')}
                    className="flex items-center gap-1 h-8"
                  >
                    <Check className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Mark Completed</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusChange(selectedSubmission._id, 'archived')}
                    className="flex items-center gap-1 h-8"
                  >
                    <X className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Archive</span>
                  </Button>
                </div>
                
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white h-8"
                  onClick={() => window.open(`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`)}
                >
                  <span className="text-xs sm:text-sm">Reply via Email</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
} 