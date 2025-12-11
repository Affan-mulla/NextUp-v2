import { UserVoteType } from "./VoteType";

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
  _count?: {
    comments: number;
  };
  userVote?: UserVoteType;
}

interface Author {
  id: string;
  image: string | null;
  name: string;
  username: string;
}