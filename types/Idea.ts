import { VoteType } from "@/hooks/useVoting";

export interface IdeaById {
  author: Author;
  createdAt: string;
  description: JSON;
  id: string;
  title: string;
  updatedAt: string;
  uploadedImages: string[] | [];
  userId: string;
  votesCount: number;
  userVote?: {
    type: VoteType;
  } | null;
  // Legacy field for backward compatibility
  userVoteType?: {
    type: VoteType;
  } | null;
}

interface Author {
  id: string;
  image: string | null;
  name: string;
  username: string;
}