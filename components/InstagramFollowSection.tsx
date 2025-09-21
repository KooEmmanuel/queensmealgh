'use client';

import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import Link from "next/link";

interface InstagramFollowProps {
  username?: string;
}

export default function InstagramFollowSection({ username = "queensmeal12" }: InstagramFollowProps) {
  return (
    <div className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-center text-white">
      <div className="max-w-2xl mx-auto">
        <Instagram className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Follow Us on Instagram</h2>
        <p className="mb-6">Stay updated with our latest recipes, cooking tips, and food inspiration!</p>
        <Link href={`https://instagram.com/${username}`} target="_blank" rel="noopener noreferrer">
          <Button className="bg-white text-pink-600 hover:bg-gray-100">
            <Instagram className="h-4 w-4 mr-2" />
            @{username}
          </Button>
        </Link>
      </div>
    </div>
  );
} 