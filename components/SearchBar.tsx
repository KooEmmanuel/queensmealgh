'use client';

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  return (
    <div className="relative w-full max-w-md">
      <Input type="search" placeholder="Search recipes..." className="pl-10 pr-4 py-2 rounded-full" />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
  );
} 