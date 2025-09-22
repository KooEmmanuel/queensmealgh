"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  DollarSign,
  MessageCircle,
  Building,
  Target,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface ConsultationRequest {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  businessName: string;
  businessType: string;
  businessSize?: string;
  website?: string;
  contentType: string;
  platforms: string[];
  currentContent?: string;
  contentGoals: string;
  budgetRange: string;
  timeline?: string;
  urgency?: string;
  specificRequirements?: string;
  previousExperience?: string;
  questions?: string;
  packageType: 'weekly' | 'monthly';
  status: 'new' | 'contacted' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  notes?: string;
  followUpDate?: string;
  requestDate: string;
  createdAt: string;
  updatedAt: string;
}

export function ConsultationRequestsList() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    notes: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, packageFilter, budgetFilter, urgencyFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (packageFilter && packageFilter !== 'all') params.append('packageType', packageFilter);
      if (budgetFilter && budgetFilter !== 'all') params.append('budgetRange', budgetFilter);
      if (urgencyFilter && urgencyFilter !== 'all') params.append('urgency', urgencyFilter);
      
      const response = await fetch(`/api/consultation/request?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching consultation requests:', error);
      toast.error('Failed to fetch consultation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/consultation/request/${selectedRequest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Consultation request updated successfully');
        setIsEditDialogOpen(false);
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultation request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/consultation/request/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Consultation request deleted successfully');
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const openEditDialog = (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setEditForm({
      status: request.status,
      priority: request.priority,
      assignedTo: request.assignedTo || '',
      notes: request.notes || '',
      followUpDate: request.followUpDate ? new Date(request.followUpDate).toISOString().split('T')[0] : ''
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBudgetRangeLabel = (range: string) => {
    switch (range) {
      case 'under-1000': return 'Under GHC 1,000';
      case '1000-3000': return 'GHC 1,000 - 3,000';
      case '3000-5000': return 'GHC 3,000 - 5,000';
      case '5000-10000': return 'GHC 5,000 - 10,000';
      case '10000-20000': return 'GHC 10,000 - 20,000';
      case 'over-20000': return 'Over GHC 20,000';
      case 'discuss': return 'Let\'s discuss';
      case 'not-sure': return 'Not sure yet';
      default: return range;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.businessName && request.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading consultation requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultation Requests</h1>
          <p className="text-gray-600">Manage incoming consultation requests and leads</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredRequests.length} requests
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Package</label>
              <Select value={packageFilter} onValueChange={setPackageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Budget</label>
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="under-1000">Under GHC 1,000</SelectItem>
                  <SelectItem value="1000-3000">GHC 1,000 - 3,000</SelectItem>
                  <SelectItem value="3000-5000">GHC 3,000 - 5,000</SelectItem>
                  <SelectItem value="5000-10000">GHC 5,000 - 10,000</SelectItem>
                  <SelectItem value="10000-20000">GHC 10,000 - 20,000</SelectItem>
                  <SelectItem value="over-20000">Over GHC 20,000</SelectItem>
                  <SelectItem value="discuss">Let's discuss</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Urgency</label>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="very-urgent">Very Urgent</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="not-urgent">Not Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultation requests found</h3>
            <p className="text-gray-500">No requests match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {request.fullName}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {request.businessName || 'Individual'} • {request.businessType || 'Not specified'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={getStatusBadgeClass(request.status)}>
                          {request.status}
                        </Badge>
                        <Badge className={getPriorityBadgeClass(request.priority)}>
                          {request.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 truncate">{request.email}</span>
                      </div>
                      {request.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{request.phone}</span>
                        </div>
                      )}
                      {request.budgetRange && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{getBudgetRangeLabel(request.budgetRange)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{request.contentType}</span>
                      </div>
                    </div>

                    {request.contentGoals && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          <strong>Goals:</strong> {request.contentGoals}
                        </p>
                      </div>
                    )}

                    {request.platforms.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {request.platforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.requestDate).toLocaleDateString()}
                      </div>
                      {request.urgency && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle className="h-4 w-4" />
                          {request.urgency}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(request)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRequest(request._id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Consultation Request</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={editForm.priority} onValueChange={(value) => setEditForm({...editForm, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned To</label>
              <Input
                value={editForm.assignedTo}
                onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
                placeholder="Enter assignee name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Follow-up Date</label>
              <Input
                type="date"
                value={editForm.followUpDate}
                onChange={(e) => setEditForm({...editForm, followUpDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Add notes about this request..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRequest}>
                Update Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}