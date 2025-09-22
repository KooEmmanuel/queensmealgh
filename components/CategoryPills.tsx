'use client';

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";

interface TikTokCategory {
  id: string;
  name: string;
}

export function getCategories() {
  // This would be replaced with actual API call in production
  return [
    { id: '1', name: 'Popular' },
    { id: '2', name: 'Recent' },
    { id: '4', name: 'Breakfast' },
    { id: '5', name: 'Dinner' },
  ];
}

export function CategoryPills() {
  const [categories, setCategories] = useState<TikTokCategory[]>([]);
  
  useEffect(() => {
    // In production, this would be an API call
    setCategories(getCategories());
  }, []);
  
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-8">
      {categories.map(category => (
        <Badge 
          key={category.id}
          className="px-4 py-2 bg-white text-orange-600 hover:bg-orange-50 cursor-pointer"
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
} 