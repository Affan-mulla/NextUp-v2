/**
 * Legacy useComment hook - Redirects to new implementation
 * @deprecated Use @/lib/hooks/use-comment-query instead
 */

export {
  useComments as useCommentSection,
  useReplies,
  useCreateComment,
  useVoteComment,
} from "@/lib/hooks/use-comment-query";
