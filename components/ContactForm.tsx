'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  type: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      });
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className="relative py-16 overflow-hidden bg-green-50">
      {/* Animated curvy lines - top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg 
          className="relative block w-full h-[60px]" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            fill="#22c55e"
          />
        </svg>
      </div>
      
      {/* Animated curvy lines - middle */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full overflow-hidden opacity-10">
        <svg 
          className="relative block w-full h-[120px]" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <motion.path 
            initial={{ x: -1200 }}
            animate={{ x: 0 }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "loop", ease: "linear" }}
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
            fill="#f97316"
          />
        </svg>
      </div>
      
      {/* Animated curvy lines - bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          className="relative block w-full h-[60px]" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            fill="#22c55e"
          />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-2">
            Get in <span className="text-green-600">Touch</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a recipe request, want to collaborate, or just want to say hello.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-sm border-green-100 relative overflow-hidden">
              {/* Decorative curved line inside card */}
              <div className="absolute -right-10 -top-10 w-40 h-40 opacity-5">
                <motion.svg 
                  viewBox="0 0 200 200" 
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ 
                    rotate: 360,
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  <path 
                    fill="#22C55E" 
                    d="M45.7,-76.2C58.9,-69.2,69.2,-55.7,76.4,-41.1C83.7,-26.4,87.9,-10.7,85.9,4.1C83.9,19,75.8,33,66.1,45.1C56.4,57.2,45.1,67.4,31.8,73.7C18.5,80,2.3,82.4,-12.4,79.1C-27.1,75.8,-40.2,66.8,-51.7,55.7C-63.2,44.6,-73,31.3,-77.9,16.2C-82.8,1.1,-82.8,-15.9,-76.9,-29.8C-71,-43.7,-59.2,-54.5,-45.9,-61.4C-32.6,-68.3,-17.8,-71.3,-1.2,-69.5C15.5,-67.7,32.5,-83.2,45.7,-76.2Z" 
                    transform="translate(100 100)" 
                  />
                </motion.svg>
              </div>
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Get in Touch</CardTitle>
                <CardDescription>
                  Fill out this quick form and we'll get back to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        required
                        className="border-gray-200"
                      />
                    </div>
                    
                    <div>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        required
                        className="border-gray-200"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone (Optional)"
                        className="border-gray-200"
                      />
                    </div>
                    
                    <div>
                      <Select 
                        value={formData.type} 
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Inquiry Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="recipe">Recipe Request</SelectItem>
                          <SelectItem value="collaboration">Brand Collaboration</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subject"
                      required
                      className="border-gray-200"
                    />
                  </div>
                  
                  <div>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your Message"
                      rows={3}
                      required
                      className="border-gray-200 resize-none"
                    />
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button 
                      type="submit" 
                      className={`w-full ${isSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-orange-500 to-green-500'} text-white`}
                      disabled={isSubmitting || isSuccess}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Message Sent
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold mb-3">
                Let's Work <span className="text-orange-500">Together</span>
              </h2>
              <p className="text-gray-600">
                Whether you're looking for a specific recipe, want to collaborate with us, or just have a question, we're here to help. Our team is passionate about food and cooking, and we'd love to hear from you.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border-l-4 border-l-green-500 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10">
                  <motion.svg 
                    viewBox="0 0 200 200" 
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <path 
                      fill="#22C55E" 
                      d="M45.7,-76.2C58.9,-69.2,69.2,-55.7,76.4,-41.1C83.7,-26.4,87.9,-10.7,85.9,4.1C83.9,19,75.8,33,66.1,45.1C56.4,57.2,45.1,67.4,31.8,73.7C18.5,80,2.3,82.4,-12.4,79.1C-27.1,75.8,-40.2,66.8,-51.7,55.7C-63.2,44.6,-73,31.3,-77.9,16.2C-82.8,1.1,-82.8,-15.9,-76.9,-29.8C-71,-43.7,-59.2,-54.5,-45.9,-61.4C-32.6,-68.3,-17.8,-71.3,-1.2,-69.5C15.5,-67.7,32.5,-83.2,45.7,-76.2Z" 
                      transform="translate(100 100)" 
                    />
                  </motion.svg>
                </div>
                <h3 className="font-semibold text-lg mb-1">Recipe Requests</h3>
                <p className="text-gray-600 text-sm">
                  Looking for a specific recipe? Let us know and we'll try to feature it in our upcoming content.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-lg border-l-4 border-l-orange-500 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10">
                  <motion.svg 
                    viewBox="0 0 200 200" 
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <path 
                      fill="#F97316" 
                      d="M45.7,-76.2C58.9,-69.2,69.2,-55.7,76.4,-41.1C83.7,-26.4,87.9,-10.7,85.9,4.1C83.9,19,75.8,33,66.1,45.1C56.4,57.2,45.1,67.4,31.8,73.7C18.5,80,2.3,82.4,-12.4,79.1C-27.1,75.8,-40.2,66.8,-51.7,55.7C-63.2,44.6,-73,31.3,-77.9,16.2C-82.8,1.1,-82.8,-15.9,-76.9,-29.8C-71,-43.7,-59.2,-54.5,-45.9,-61.4C-32.6,-68.3,-17.8,-71.3,-1.2,-69.5C15.5,-67.7,32.5,-83.2,45.7,-76.2Z" 
                      transform="translate(100 100)" 
                    />
                  </motion.svg>
                </div>
                <h3 className="font-semibold text-lg mb-1">Brand Collaborations</h3>
                <p className="text-gray-600 text-sm">
                  We're always open to working with food brands and kitchen equipment companies. Reach out to discuss partnership opportunities.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border-l-4 border-l-green-500 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10">
                  <motion.svg 
                    viewBox="0 0 200 200" 
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <path 
                      fill="#22C55E" 
                      d="M45.7,-76.2C58.9,-69.2,69.2,-55.7,76.4,-41.1C83.7,-26.4,87.9,-10.7,85.9,4.1C83.9,19,75.8,33,66.1,45.1C56.4,57.2,45.1,67.4,31.8,73.7C18.5,80,2.3,82.4,-12.4,79.1C-27.1,75.8,-40.2,66.8,-51.7,55.7C-63.2,44.6,-73,31.3,-77.9,16.2C-82.8,1.1,-82.8,-15.9,-76.9,-29.8C-71,-43.7,-59.2,-54.5,-45.9,-61.4C-32.6,-68.3,-17.8,-71.3,-1.2,-69.5C15.5,-67.7,32.5,-83.2,45.7,-76.2Z" 
                      transform="translate(100 100)" 
                    />
                  </motion.svg>
                </div>
                <h3 className="font-semibold text-lg mb-1">Feedback & Suggestions</h3>
                <p className="text-gray-600 text-sm">
                  Your feedback helps us improve. Share your thoughts, suggestions, or experiences with our recipes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 