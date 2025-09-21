export interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category?: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
} 