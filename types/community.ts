export interface UserProfile {
  _id: string;
  username: string;
  displayName: string;
  email?: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  postCount: number;
  commentCount: number;
  likeCount: number;
  reputation: number;
  badges: string[];
  isVerified: boolean;
  lastActive: string;
}

export interface Reply {
  _id: string;
  content: string;
  author: string;
  authorDisplayName: string;
  authorAvatar?: string;
  authorReputation: number;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface Comment {
  _id: string;
  content: string;
  author: string;
  authorDisplayName: string;
  authorAvatar?: string;
  authorReputation: number;
  authorBadges: string[];
  createdAt: string;
  likes: number;
  replies: Reply[];
  isLiked?: boolean;
}

export interface Thread {
  _id: string;
  title: string;
  content: string;
  author: string;
  authorDisplayName: string;
  authorAvatar?: string;
  authorReputation: number;
  authorBadges: string[];
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
  comments: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
}