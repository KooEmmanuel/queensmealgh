"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, CheckCircle, X, MessageCircle, Calendar, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface ConsultationRequestFormProps {
  packageType: 'weekly' | 'monthly';
  trigger: React.ReactNode;
}

export function ConsultationRequestForm({ packageType, trigger }: ConsultationRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    businessSize: '',
    website: '',
    
    // Content Needs
    contentType: '',
    platforms: [] as string[],
    currentContent: '',
    contentGoals: '',
    
    // Budget and Timeline
    budgetRange: '',
    timeline: '',
    urgency: '',
    
    // Additional Information
    specificRequirements: '',
    previousExperience: '',
    questions: ''
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation - only name and email are required
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error('Please fill in your name and email address', {
        description: 'These are the only required fields.',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/consultation/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          packageType,
          requestDate: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Consultation request submitted successfully!', {
          description: 'We\'ll reach out to you within 24 hours to discuss your project.',
          duration: 5000,
        });
        setIsOpen(false);
        resetForm();
      } else {
        toast.error('Failed to submit request', {
          description: data.error || 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      businessName: '',
      businessType: '',
      businessSize: '',
      website: '',
      contentType: '',
      platforms: [],
      currentContent: '',
      contentGoals: '',
      budgetRange: '',
      timeline: '',
      urgency: '',
      specificRequirements: '',
      previousExperience: '',
      questions: ''
    });
  };

  const platforms = [
    'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn', 'Pinterest', 'Blog'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Request Free Consultation - {packageType === 'weekly' ? 'Weekly' : 'Monthly'} Package
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Tell us about your project and content needs. Only your name and email are required - everything else is optional to help us understand your needs better!
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant/Food Service</SelectItem>
                    <SelectItem value="food-brand">Food Brand/Product</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="food-blog">Food Blog/Influencer</SelectItem>
                    <SelectItem value="cooking-school">Cooking School/Classes</SelectItem>
                    <SelectItem value="food-delivery">Food Delivery</SelectItem>
                    <SelectItem value="personal">Personal/Individual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessSize">Business Size</Label>
                <Select value={formData.businessSize} onValueChange={(value) => handleInputChange('businessSize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-5 employees)</SelectItem>
                    <SelectItem value="small">Small (6-20 employees)</SelectItem>
                    <SelectItem value="medium">Medium (21-50 employees)</SelectItem>
                    <SelectItem value="large">Large (50+ employees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website/Social Media</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com or @yourhandle"
                />
              </div>
            </div>
          </div>

          {/* Content Needs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Content Needs
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="contentType">What type of content do you need? *</Label>
              <Select value={formData.contentType} onValueChange={(value) => handleInputChange('contentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recipe-videos">Recipe Videos</SelectItem>
                  <SelectItem value="cooking-tutorials">Cooking Tutorials</SelectItem>
                  <SelectItem value="food-photography">Food Photography</SelectItem>
                  <SelectItem value="social-media-content">Social Media Content</SelectItem>
                  <SelectItem value="brand-promotion">Brand Promotion</SelectItem>
                  <SelectItem value="educational-content">Educational Content</SelectItem>
                  <SelectItem value="mixed">Mixed Content</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Which platforms do you want to focus on?</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformToggle(platform)}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      formData.platforms.includes(platform)
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentContent">Tell us about your current content strategy</Label>
              <Textarea
                id="currentContent"
                value={formData.currentContent}
                onChange={(e) => handleInputChange('currentContent', e.target.value)}
                placeholder="What content are you currently creating? What's working? What's not?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentGoals">What are your main content goals?</Label>
              <Textarea
                id="contentGoals"
                value={formData.contentGoals}
                onChange={(e) => handleInputChange('contentGoals', e.target.value)}
                placeholder="e.g., Increase brand awareness, drive sales, build community, educate customers... (optional)"
                rows={3}
              />
            </div>
          </div>

          {/* Budget and Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget & Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetRange">Budget Range</Label>
                <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-1000">Under GHC 1,000</SelectItem>
                    <SelectItem value="1000-3000">GHC 1,000 - 3,000</SelectItem>
                    <SelectItem value="3000-5000">GHC 3,000 - 5,000</SelectItem>
                    <SelectItem value="5000-10000">GHC 5,000 - 10,000</SelectItem>
                    <SelectItem value="10000-20000">GHC 10,000 - 20,000</SelectItem>
                    <SelectItem value="over-20000">Over GHC 20,000</SelectItem>
                    <SelectItem value="discuss">Let's discuss</SelectItem>
                    <SelectItem value="not-sure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Project Timeline</Label>
                <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="1-month">Within 1 month</SelectItem>
                    <SelectItem value="2-3-months">2-3 months</SelectItem>
                    <SelectItem value="3-6-months">3-6 months</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">How urgent is this project?</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-urgent">Very Urgent</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="not-urgent">Not Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="specificRequirements">Any specific requirements or preferences?</Label>
              <Textarea
                id="specificRequirements"
                value={formData.specificRequirements}
                onChange={(e) => handleInputChange('specificRequirements', e.target.value)}
                placeholder="e.g., Specific style, cultural considerations, dietary restrictions, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousExperience">Previous experience with content creators?</Label>
              <Textarea
                id="previousExperience"
                value={formData.previousExperience}
                onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                placeholder="Tell us about any previous collaborations or experiences..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questions">Any questions for us?</Label>
              <Textarea
                id="questions"
                value={formData.questions}
                onChange={(e) => handleInputChange('questions', e.target.value)}
                placeholder="Ask us anything about our services, process, or how we can help you..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Request Free Consultation
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>We'll review your request and get back to you within 24 hours.</p>
            <p>No payment required - this is a free consultation to discuss your needs!</p>
            <p className="mt-2 text-xs text-gray-400">
              💡 <strong>Tip:</strong> The more information you provide, the better we can tailor our consultation to your specific needs.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}