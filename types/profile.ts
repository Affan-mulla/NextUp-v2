import { VoteType } from "@prisma/client";

export interface ProfileUser {
  id: string;
  username: string;
  name: string;
  image: string | null;
  createdAt: Date;
  _count: {
    ideas: number;
    comments: number;
  };
  upvotesReceived: number;
  downvotesReceived: number;
}

export interface ProfilePost {
  id: string;
  title: string;
  description: any;
  votesCount: number;
  createdAt: Date;
  uploadedImages: string[];
  _count: {
    comments: number;
  };
}

export interface ProfileComment {
  id: string;
  content: string;
  votesCount: number;
  createdAt: Date;
  idea: {
    id: string;
    title: string;
  } | null;
  post: {
    id: string;
    title: string;
  } | null;
}

export interface ProfileVote {
  id: string;
  type: VoteType;
  createdAt: Date;
  idea: {
    id: string;
    title: string;
    votesCount: number;
    author: {
      username: string;
      name: string;
      image: string | null;
    };
  };
}

export type SortBy = "latest" | "top";

export interface PaginationParams {
  cursor?: string;
  limit?: number;
  sortBy?: SortBy;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
