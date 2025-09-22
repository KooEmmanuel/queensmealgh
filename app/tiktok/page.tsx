import { TikTokFeed } from "@/components/TikTokFeed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTok Recipes - Queens Meal",
  description: "Explore our collection of delicious TikTok recipes and cooking videos from Queens Meal.",
};

export default function TikTokPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-6">
            TikTok Recipes
          </h1>
          <p className="text-xl md:text-2xl font-sourcesans opacity-90 max-w-3xl mx-auto">
            Discover amazing recipes and cooking tips from our TikTok collection
          </p>
        </div>
      </section>

      {/* TikTok Feed Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <TikTokFeed />
        </div>
      </section>
    </div>
  );
}