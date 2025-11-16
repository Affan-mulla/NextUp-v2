/**
 * Comment System TypeScript Types
 * Comprehensive type definitions for the comment system
 */

import { VoteType } from "@prisma/client";

// Base Comment User
export interface CommentUser {
  id: string;
  username: string;
  image: string | null;
}

// Vote information for a comment
export interface CommentVote {
  id: string;
  userId: string;
  commentId: string;
  type: VoteType;
  createdAt: Date;
}

// Comment with all relations
export interface Comment {
  id: string;
  content: string;
  userId: string;
  ideaId: string | null;
  postId: string | null;
  commentId: string | null;
  votesCount: number;
  isDeleted: boolean;
  createdAt: Date;
  user: CommentUser;
  _count: {
    replies: number;
  };
  userVote?: VoteType | null; // User's vote on this comment
}

// Paginated comment response
export interface CommentListResponse {
  comments: Comment[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

// Reply list response
export interface ReplyListResponse {
  replies: Comment[];
  hasMore: boolean;
  nextCursor: string | null;
}

// Create comment request
export interface CreateCommentRequest {
  content: string;
  ideaId: string;
  commentId?: string; // For replies
}

// Create comment response
export interface CreateCommentResponse {
  comment: Comment;
  message: string;
}

// Vote request
export interface VoteCommentRequest {
  commentId: string;
  voteType: VoteType | null; // null to remove vote
}

// Vote response
export interface VoteCommentResponse {
  success: boolean;
  votesCount: number;
  userVote: VoteType | null;
  message: string;
}

// Error response
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// React Query cache types
export interface CommentCacheData {
  pages: Array<{
    comments: Comment[];
    nextCursor: string | null;
  }>;
  pageParams: (string | null)[];
}

// Optimistic update context
export interface OptimisticVoteContext {
  previousData: CommentCacheData | undefined;
  previousVote: VoteType | null;
}

// Form values
export interface CommentFormValues {
  content: string;
}

// Component props
export interface CommentFormProps {
  ideaId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export interface CommentProps {
  comment: Comment;
  ideaId: string;
  depth?: number;
  maxDepth?: number;
}

export interface VotesButtonProps {
  commentId: string;
  ideaId: string;
  initialVotesCount: number;
  initialUserVote?: VoteType | null;
  size?: "sm" | "md" | "lg";
}

export interface CommentSectionProps {
  ideaId: string;
  initialComments?: Comment[];
}
