import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, Calendar, Instagram, Video } from "lucide-react"

export default function ServicesSection() {
  return (
    <section className="w-full py-16 bg-gradient-to-b from-white to-pink-50 font-sourcesans">
      <div className="container px-4 md:px-6 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-10 -rotate-12">
          <UtensilsCrossed size={80} className="text-gray-300" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 rotate-12">
          <UtensilsCrossed size={80} className="text-gray-300" />
        </div>

        <div className="flex flex-col items-center justify-center space-y-12 text-center">
          <div className="relative">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-500 font-playfair">
              SERVICES
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-orange-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="w-full max-w-5xl grid gap-8 md:grid-cols-2 lg:gap-16">
            {/* Weekly Package */}
            <Card className="group flex flex-col justify-between border-0 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-orange-50 opacity-50 rounded-xl"></div>
              <CardHeader className="pb-2 relative z-10 bg-gradient-to-r from-pink-100 to-orange-100 pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-center font-playfair">WEEKLY PACKAGE</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 relative z-10">
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Video className="h-5 w-5 text-pink-500" />
                  <p className="text-lg font-medium">Maximum of 2 Videos</p>
                </div>
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  <p className="text-lg font-medium">Instagram and TikTok</p>
                </div>
                <div className="h-0.5 w-16 bg-gradient-to-r from-pink-300 to-orange-300 mx-auto my-6 rounded-full"></div>
              </CardContent>
              <CardFooter className="pt-2 flex flex-col items-center pb-8 relative z-10">
                <p className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-orange-600 font-montserrat">
                  GHC 3000
                </p>
                <p className="text-sm text-gray-500 mt-2">Per week</p>
              </CardFooter>
            </Card>

            {/* Monthly Package */}
            <Card className="group flex flex-col justify-between border-0 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-pink-50 opacity-50 rounded-xl"></div>
              <CardHeader className="pb-2 relative z-10 bg-gradient-to-r from-orange-100 to-pink-100 pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-center font-playfair">MONTHLY PACKAGE</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 relative z-10">
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Video className="h-5 w-5 text-orange-500" />
                  <p className="text-lg font-medium">Minimum of 4 Videos</p>
                </div>
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Instagram className="h-5 w-5 text-orange-500" />
                  <p className="text-lg font-medium">Instagram and TikTok</p>
                </div>
                <div className="h-0.5 w-16 bg-gradient-to-r from-orange-300 to-pink-300 mx-auto my-6 rounded-full"></div>
              </CardContent>
              <CardFooter className="pt-2 flex flex-col items-center pb-8 relative z-10">
                <p className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-pink-600 font-montserrat">
                  GHC 5000
                </p>
                <p className="text-sm text-gray-500 mt-2">Per month</p>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-12 max-w-xl text-center">
            <p className="text-lg text-gray-600 italic">
              "Elevate your brand with engaging food content that resonates with your audience"
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 