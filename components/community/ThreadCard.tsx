"use client";
import { useState } from 'react';
import { Thread, Comment, Reply as ReplyType } from '@/types/community';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Copy,
  ExternalLink,
  ThumbsDown,
  Eye,
  Clock,
  User,
  Crown,
  Star,
  CheckCircle
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';


interface ThreadCardProps {
  thread: Thread;
  currentUser?: any;
  onLike: (threadId: string) => void;
  onComment: (threadId: string, content: string) => void;
  onReply: (commentId: string, content: string) => void;
  onCommentLike: (commentId: string) => void;
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
  onCommentLike,
  onBookmark, 
  onShare, 
  onReport 
}: ThreadCardProps) {
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newReplies, setNewReplies] = useState<{[key: string]: string}>({});
  const [showReplyForm, setShowReplyForm] = useState<{[key: string]: boolean}>({});
  const [showReplies, setShowReplies] = useState<{[key: string]: boolean}>({});
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

  const toggleReplies = (commentId: string) => {
    setShowReplies({ ...showReplies, [commentId]: !showReplies[commentId] });
  };

  const handleReportThread = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to report threads.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/community/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: thread._id,
          reporterId: currentUser._id,
          reason: 'inappropriate_content', // Default reason, could be made configurable
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Thread Reported",
          description: "Thank you for your report. We'll review it shortly.",
        });
      } else {
        toast({
          title: "Report Failed",
          description: data.error || "Failed to report thread. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error reporting thread:', error);
      toast({
        title: "Report Failed",
        description: "Failed to report thread. Please try again.",
        variant: "destructive",
      });
    }
  };

  const authorBadge = getReputationBadge(thread.authorReputation);
  const BadgeIcon = authorBadge.icon;

  return (
    <Card className="w-full border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300">
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
              <AvatarImage src={thread.authorAvatar} alt={thread.authorDisplayName} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-orange-400 text-white text-xs sm:text-sm font-bold">
                {thread.authorDisplayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                  {thread.authorDisplayName}
                </h3>
                {thread.authorBadges && thread.authorBadges.includes('verified') && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
                <Badge className={`${authorBadge.color} text-xs`}>
                  <BadgeIcon className="h-3 w-3 mr-1" />
                  {authorBadge.text}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span className="truncate">{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                {thread.updatedAt !== thread.createdAt && (
                  <>
                    <span>•</span>
                    <span>edited</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            {thread.isPinned && (
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                📌 Pinned
              </Badge>
            )}
            {thread.isLocked && (
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                🔒 Locked
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(window.location.href, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save Thread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReportThread}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report Thread
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
        {/* Category and Tags */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {thread.category}
          </Badge>
          {thread.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Thread Title */}
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
          {thread.title}
        </h2>

        {/* Thread Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {thread.content}
          </p>
        </div>

        {/* Thread Stats */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            {thread.views} views
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            {thread.comments?.length || 0} comments
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-orange-100">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant={thread.isLiked ? "default" : "outline"}
              size="sm"
              onClick={() => onLike(thread._id)}
              className={`${thread.isLiked ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white" : "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"} h-8 sm:h-9 px-2 sm:px-3 font-medium transition-all duration-300`}
            >
              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${thread.isLiked ? "fill-current" : ""} ${thread.likes > 0 ? "mr-1" : ""}`} />
              {thread.likes > 0 && <span className="text-xs sm:text-sm font-medium">{thread.likes}</span>}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 h-8 sm:h-9 px-2 sm:px-3 font-medium transition-all duration-300"
            >
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">{showComments ? 'Hide Comments' : 'Show Comments'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBookmark(thread._id)}
              className={`${thread.isBookmarked ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-yellow-400" : "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"} h-8 sm:h-9 px-2 sm:px-3 font-medium transition-all duration-300`}
            >
              <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 ${thread.isBookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(thread)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 sm:h-9 sm:w-9 p-0 transition-all duration-300"
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReport(thread._id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9 p-0 transition-all duration-300"
            >
              <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
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
              {thread.comments && thread.comments.length > 0 ? thread.comments.map((comment) => {
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
                          {comment.authorBadges && comment.authorBadges.includes('verified') && (
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
                            onClick={() => onCommentLike(comment._id)}
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
                      <div className="ml-11">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReplies(comment._id)}
                          className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 mb-2"
                        >
                          {showReplies[comment._id] ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </Button>
                        
                        {(showReplies[comment._id] !== false) && (
                          <div className="space-y-2">
                            {comment.replies.map((reply) => {
                          const replyAuthorBadge = getReputationBadge(reply.authorReputation);
                          const ReplyBadgeIcon = replyAuthorBadge.icon;

                          return (
                            <div key={reply._id} className="flex gap-3 ml-4 border-l-2 border-gray-100 pl-3 py-2">
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
                                
                                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                                  {reply.content}
                                </p>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs hover:bg-gray-100"
                                  onClick={() => onLike(reply._id)}
                                >
                                  <ThumbsUp className={`h-3 w-3 mr-1 ${reply.isLiked ? "fill-current text-blue-600" : "text-gray-500"}`} />
                                  {reply.likes > 0 && <span className="text-xs">{reply.likes}</span>}
                                </Button>
                              </div>
                            </div>
                          );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="text-center text-gray-500 py-4">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}