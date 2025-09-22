"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Reply,
  Send,
  Flag,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  User,
  Crown,
  Star,
  CheckCircle
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface Comment {
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

interface Reply {
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

interface Thread {
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

interface ThreadCardProps {
  thread: Thread;
  currentUser?: any;
  onLike: (threadId: string) => void;
  onComment: (threadId: string, content: string) => void;
  onReply: (commentId: string, content: string) => void;
  onBookmark: (threadId: string) => void;
  onShare: (thread: Thread) => void;
  onReport: (threadId: string) => void;
}

export function ThreadCard({ 
  thread, 
  currentUser, 
  onLike, 
  onComment, 
  onReply, 
  onBookmark, 
  onShare, 
  onReport 
}: ThreadCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newReplies, setNewReplies] = useState<{[key: string]: string}>({});
  const [showReplyForm, setShowReplyForm] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 1000) return { color: 'bg-purple-100 text-purple-800', text: 'Legend', icon: Crown };
    if (reputation >= 500) return { color: 'bg-gold-100 text-gold-800', text: 'Expert', icon: Star };
    if (reputation >= 100) return { color: 'bg-blue-100 text-blue-800', text: 'Veteran', icon: Star };
    if (reputation >= 50) return { color: 'bg-green-100 text-green-800', text: 'Regular', icon: Star };
    return { color: 'bg-gray-100 text-gray-800', text: 'Newcomer', icon: User };
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    onComment(thread._id, newComment);
    setNewComment('');
  };

  const handleReplySubmit = (commentId: string) => {
    const replyContent = newReplies[commentId];
    if (!replyContent?.trim()) return;
    onReply(commentId, replyContent);
    setNewReplies({ ...newReplies, [commentId]: '' });
    setShowReplyForm({ ...showReplyForm, [commentId]: false });
  };

  const toggleReplyForm = (commentId: string) => {
    setShowReplyForm({ ...showReplyForm, [commentId]: !showReplyForm[commentId] });
  };

  const authorBadge = getReputationBadge(thread.authorReputation);
  const BadgeIcon = authorBadge.icon;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={thread.authorAvatar} alt={thread.authorDisplayName} />
              <AvatarFallback className="bg-green-100 text-green-800">
                {thread.authorDisplayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {thread.authorDisplayName}
                </h3>
                {thread.authorBadges.includes('verified') && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
                <Badge className={`${authorBadge.color} text-xs`}>
                  <BadgeIcon className="h-3 w-3 mr-1" />
                  {authorBadge.text}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                {thread.updatedAt !== thread.createdAt && (
                  <>
                    <span>•</span>
                    <span>edited</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {thread.isPinned && (
              <Badge variant="outline" className="text-xs">
                📌 Pinned
              </Badge>
            )}
            {thread.isLocked && (
              <Badge variant="outline" className="text-xs">
                🔒 Locked
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category and Tags */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {thread.category}
          </Badge>
          {thread.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Thread Title */}
        <h2 className="text-xl font-bold text-gray-900 leading-tight">
          {thread.title}
        </h2>

        {/* Thread Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {thread.content}
          </p>
        </div>

        {/* Thread Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {thread.views} views
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {thread.comments.length} comments
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Button
              variant={thread.isLiked ? "default" : "outline"}
              size="sm"
              onClick={() => onLike(thread._id)}
              className={thread.isLiked ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Heart className={`h-4 w-4 mr-1 ${thread.isLiked ? "fill-current" : ""}`} />
              {thread.likes}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Comment
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBookmark(thread._id)}
              className={thread.isBookmarked ? "bg-yellow-50 border-yellow-200" : ""}
            >
              <Bookmark className={`h-4 w-4 ${thread.isBookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(thread)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReport(thread._id)}
              className="text-red-600 hover:text-red-700"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {/* New Comment Form */}
            {currentUser && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
                    <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">
                    Comment as {currentUser.displayName}
                  </span>
                </div>
                
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Post Comment
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {thread.comments.map((comment) => {
                const commentAuthorBadge = getReputationBadge(comment.authorReputation);
                const CommentBadgeIcon = commentAuthorBadge.icon;

                return (
                  <div key={comment._id} className="space-y-3">
                    {/* Comment */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={comment.authorAvatar} alt={comment.authorDisplayName} />
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                          {comment.authorDisplayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {comment.authorDisplayName}
                          </span>
                          {comment.authorBadges.includes('verified') && (
                            <CheckCircle className="h-3 w-3 text-blue-500" />
                          )}
                          <Badge className={`${commentAuthorBadge.color} text-xs`}>
                            <CommentBadgeIcon className="h-3 w-3 mr-1" />
                            {commentAuthorBadge.text}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {comment.content}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => onLike(comment._id)}
                          >
                            <ThumbsUp className={`h-3 w-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
                            {comment.likes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleReplyForm(comment._id)}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Reply Form */}
                    {showReplyForm[comment._id] && currentUser && (
                      <div className="ml-11 space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
                            <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                              {currentUser.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-gray-700">
                            Reply as {currentUser.displayName}
                          </span>
                        </div>
                        
                        <Textarea
                          placeholder="Write a reply..."
                          value={newReplies[comment._id] || ''}
                          onChange={(e) => setNewReplies({ ...newReplies, [comment._id]: e.target.value })}
                          rows={2}
                          className="text-sm"
                        />
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleReplyForm(comment._id)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReplySubmit(comment._id)}
                            disabled={!newReplies[comment._id]?.trim()}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-11 space-y-2">
                        {comment.replies.map((reply) => {
                          const replyAuthorBadge = getReputationBadge(reply.authorReputation);
                          const ReplyBadgeIcon = replyAuthorBadge.icon;

                          return (
                            <div key={reply._id} className="flex gap-2">
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarImage src={reply.authorAvatar} alt={reply.authorDisplayName} />
                                <AvatarFallback className="bg-gray-100 text-gray-800 text-xs">
                                  {reply.authorDisplayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs text-gray-900">
                                    {reply.authorDisplayName}
                                  </span>
                                  <Badge className={`${replyAuthorBadge.color} text-xs`}>
                                    <ReplyBadgeIcon className="h-2 w-2 mr-1" />
                                    {replyAuthorBadge.text}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                                
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {reply.content}
                                </p>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 px-1 text-xs mt-1"
                                  onClick={() => onLike(reply._id)}
                                >
                                  <ThumbsUp className={`h-3 w-3 mr-1 ${reply.isLiked ? "fill-current" : ""}`} />
                                  {reply.likes}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}