"use client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionForm } from "@/components/SubscriptionForm"
import { 
  UtensilsCrossed, 
  Calendar, 
  Instagram, 
  Video, 
  CheckCircle, 
  Star,
  Users,
  Clock,
  Camera,
  Edit,
  Share2,
  TrendingUp,
  Award,
  Heart
} from "lucide-react"
import { motion } from "framer-motion"

export default function ServicesSection() {
  return (
    <section className="w-full py-20 bg-gradient-to-br from-green-50 via-white to-orange-50 font-sourcesans">
      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-5 -rotate-12">
          <UtensilsCrossed size={120} className="text-green-300" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-5 rotate-12">
          <UtensilsCrossed size={120} className="text-orange-300" />
        </div>

        <div className="flex flex-col items-center justify-center space-y-16 text-center">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Professional Food Content Services
            </div>
            
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-orange-500 font-playfair">
              OUR SERVICES
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-orange-500 mx-auto mt-4 rounded-full"></div>
            
            <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto leading-relaxed">
              Transform your food business with professional content creation that tells your story, 
              engages your audience, and drives growth across all digital platforms.
            </p>
          </motion.div>

          {/* Services Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { icon: Camera, title: "Video Production", desc: "High-quality cooking videos" },
                { icon: Edit, title: "Content Creation", desc: "Engaging social media posts" },
                { icon: Share2, title: "Multi-Platform", desc: "Instagram, TikTok & more" },
                { icon: TrendingUp, title: "Growth Strategy", desc: "Data-driven content plans" }
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-600">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="w-full max-w-5xl mx-auto"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-3 font-playfair">Simple Pricing</h3>
              <p className="text-gray-600">Choose what works for your business</p>
            </div>

            <div className="flex justify-center">
              <div className="grid gap-6 md:grid-cols-2 w-full max-w-3xl">
              {/* Weekly Package */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="group flex flex-col justify-between border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                  <CardHeader className="pb-3 pt-6">
                    <CardTitle className="text-xl font-bold text-center font-playfair text-gray-800">Weekly</CardTitle>
                    <p className="text-center text-gray-500 text-sm">Perfect for testing</p>
                  </CardHeader>
                  
                  <CardContent className="text-center py-4 px-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-gray-600">2 Videos per week</p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-gray-600">Instagram & TikTok</p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-gray-600">Professional editing</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-center text-gray-800 font-montserrat">
                        GHC 3,000
                      </p>
                      <p className="text-xs text-gray-500">per week</p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-3 pb-6 px-6">
                    <SubscriptionForm
                      packageType="weekly"
                      amount={3000}
                      trigger={
                        <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg font-medium transition-all duration-300">
                          Get Started
                        </Button>
                      }
                    />
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Monthly Package - Featured */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Popular Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Popular
                  </div>
                </div>
                
                <Card className="group flex flex-col justify-between border-2 border-green-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                  <CardHeader className="pb-3 pt-8">
                    <CardTitle className="text-xl font-bold text-center font-playfair text-gray-800">Monthly</CardTitle>
                    <p className="text-center text-gray-500 text-sm">Best value</p>
                  </CardHeader>
                  
                  <CardContent className="text-center py-4 px-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-gray-600">4+ Videos per month</p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-gray-600">All platforms</p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-gray-600">Premium editing</p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-gray-600">Priority support</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-center text-gray-800 font-montserrat">
                        GHC 5,000
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-3 pb-6 px-6">
                    <SubscriptionForm
                      packageType="monthly"
                      amount={5000}
                      trigger={
                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-all duration-300">
                          Choose Monthly
                        </Button>
                      }
                    />
                  </CardFooter>
                </Card>
              </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Additional Benefits */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            viewport={{ once: true }}
            className="w-full max-w-3xl mx-auto"
          >
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-center text-gray-800 mb-4">What's Included</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                {[
                  "Professional editing",
                  "Social media optimization", 
                  "24/7 support"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Testimonial */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            viewport={{ once: true }}
            className="max-w-2xl text-center mx-auto"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-3" />
              <p className="text-gray-700 italic mb-3 font-sourcesans">
                "Queens Meal transformed our social media presence. Our engagement increased by 300%!"
              </p>
              <p className="text-gray-600 text-sm font-medium">- Sarah K., Restaurant Owner</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 