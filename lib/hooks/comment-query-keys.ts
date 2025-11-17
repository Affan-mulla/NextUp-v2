/**
 * React Query Keys for Comment System
 * Centralized query key factory for consistent cache management
 */

export const commentKeys = {
  all: ['comments'] as const,
  
  lists: () => [...commentKeys.all, 'list'] as const,
  
  list: (ideaId: string) => [...commentKeys.lists(), { ideaId }] as const,
  
  replies: (commentId: string) => [...commentKeys.all, 'replies', { commentId }] as const,
  
  votes: () => [...commentKeys.all, 'votes'] as const,
  
  vote: (commentId: string) => [...commentKeys.votes(), { commentId }] as const,
} as const;
