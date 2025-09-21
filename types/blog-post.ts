export interface BlogPost {
  _id: string;
  title: string;
  excerpt?: string; // Made optional based on filtering logic
  content: string;
  coverImage?: string; // Use coverImage based on previous edits
  category?: string; // Made optional based on filtering logic
  author: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  status?: 'published' | 'draft'; // Added status based on example data
  createdAt: string; // Or Date
  updatedAt?: string; // Or Date, made optional
}