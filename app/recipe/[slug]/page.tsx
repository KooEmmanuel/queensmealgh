import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, ChefHat, Bookmark, Printer, Share2, Star } from "lucide-react"
import Footer from '@/components/Footer'

export default function RecipePage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="text-2xl font-bold">
                FLAV<span className="text-orange-500">ORIZ</span>
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="font-medium text-gray-600 hover:text-orange-500 transition-colors">
              HOME
            </Link>
            <Link href="/about" className="font-medium text-gray-600 hover:text-orange-500 transition-colors">
              ABOUT
            </Link>
            <Link href="/recipes" className="font-medium text-black hover:text-orange-500 transition-colors">
              RECIPES
            </Link>
            <Link href="/blog" className="font-medium text-gray-600 hover:text-orange-500 transition-colors">
              BLOG
            </Link>
            <Link href="/contact" className="font-medium text-gray-600 hover:text-orange-500 transition-colors">
              CONTACT
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="rounded-full">
              <Bookmark className="h-5 w-5" />
              <span className="sr-only">Save recipe</span>
            </Button>
            <Button size="icon" variant="ghost" className="rounded-full">
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share recipe</span>
            </Button>
            <Button size="icon" variant="ghost" className="rounded-full">
              <Printer className="h-5 w-5" />
              <span className="sr-only">Print recipe</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Recipe Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Classic Italian Beef Maltagliati</h1>
            <p className="text-gray-600 mb-6">
              Layers of rich goodness, hearty meat, and savory sauce. A timeless favorite with Mediterranean roots.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">45 mins</span>
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Beginner Friendly</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Serves 4</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm">(500+)</span>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/placeholder.svg?height=500&width=900"
                alt="Classic Italian Beef Maltagliati"
                width={900}
                height={500}
                className="w-full object-cover h-[400px]"
              />
              <Badge className="absolute top-4 right-4 bg-white text-black">
                <span className="text-xs">500+</span>
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-bold mb-4">Ingredients</h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>500g ground beef</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>2 tbsp olive oil</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>1 onion, finely chopped</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>2 cloves garlic, minced</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>1 carrot, diced</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>1 celery stalk, diced</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>400g canned tomatoes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>2 tbsp tomato paste</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>1 cup beef stock</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>250g maltagliati pasta</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>Fresh basil leaves</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>Grated Parmesan cheese</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span>Salt and pepper to taste</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Instructions</h2>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p>
                      Heat olive oil in a large pan over medium heat. Add onion, carrot, and celery, and sauté until
                      softened, about 5 minutes.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p>Add garlic and cook for another minute until fragrant.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p>Add ground beef and cook until browned, breaking it up with a wooden spoon as it cooks.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p>Stir in tomato paste and cook for 1-2 minutes.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <p>
                      Add canned tomatoes and beef stock. Season with salt and pepper. Bring to a simmer, then reduce
                      heat and cook for 30 minutes, stirring occasionally.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <p>
                      Meanwhile, cook the maltagliati pasta according to package instructions until al dente. Drain,
                      reserving a cup of pasta water.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
                    7
                  </div>
                  <div>
                    <p>
                      Add the cooked pasta to the sauce, along with a splash of pasta water if needed to loosen the
                      sauce.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
                    8
                  </div>
                  <div>
                    <p>Serve hot, garnished with fresh basil leaves and grated Parmesan cheese.</p>
                  </div>
                </li>
              </ol>

              <div className="mt-12 bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-bold mb-4">Chef's Tips</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500 mt-2"></span>
                    <span>For an authentic Italian flavor, use San Marzano tomatoes if available.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500 mt-2"></span>
                    <span>The sauce can be made a day ahead and refrigerated to enhance the flavors.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500 mt-2"></span>
                    <span>If maltagliati pasta is not available, you can use pappardelle or tagliatelle instead.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg">
                    <Image
                      src="/placeholder.svg?height=200&width=300"
                      alt={`Related recipe ${i + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-bold mt-3 group-hover:text-orange-500">
                    {["Spaghetti Carbonara", "Lasagna Bolognese", "Risotto Milanese"][i]}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Another Italian classic you'll love</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
