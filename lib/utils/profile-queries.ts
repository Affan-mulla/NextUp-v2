import { prisma } from "@/lib/prisma";
import { VoteType } from "@prisma/client";
import { cache } from "react";

export interface ProfileData {
  id: string;
  username: string;
  name: string;
  image: string | null;
  createdAt: Date;
  bio?: string | null;
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

export const getUserProfile = cache(async (username: string): Promise<ProfileData | null> => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          ideas: true,
          comments: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const [upvotesReceived, downvotesReceived] = await Promise.all([
    prisma.votes.count({
      where: {
        idea: {
          userId: user.id,
        },
        type: "UP",
      },
    }),
    prisma.votes.count({
      where: {
        idea: {
          userId: user.id,
        },
        type: "DOWN",
      },
    }),
  ]);

  return {
    ...user,
    upvotesReceived,
    downvotesReceived,
  };
});

export async function getUserPosts(
  username: string,
  cursor?: string,
  limit = 10,
  sortBy: "latest" | "top" = "latest"
): Promise<{ posts: ProfilePost[]; nextCursor: string | null }> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return { posts: [], nextCursor: null };
  }

  const orderBy = sortBy === "latest" 
    ? { createdAt: "desc" as const }
    : { votesCount: "desc" as const };

  const posts = await prisma.ideas.findMany({
    where: {
      userId: user.id,
      ...(cursor && {
        id: {
          lt: cursor,
        },
      }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      votesCount: true,
      createdAt: true,
      uploadedImages: true,
      _count: {
        select: {
          comments: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
    orderBy,
    take: limit + 1,
  });

  const hasNextPage = posts.length > limit;
  const results = hasNextPage ? posts.slice(0, -1) : posts;

  return {
    posts: results,
    nextCursor: hasNextPage ? results[results.length - 1].id : null,
  };
}

export async function getUserComments(
  username: string,
  cursor?: string,
  limit = 10,
  sortBy: "latest" | "top" = "latest"
): Promise<{ comments: ProfileComment[]; nextCursor: string | null }> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return { comments: [], nextCursor: null };
  }

  const orderBy = sortBy === "latest" 
    ? { createdAt: "desc" as const }
    : { votesCount: "desc" as const };

  const comments = await prisma.comments.findMany({
    where: {
      userId: user.id,
      isDeleted: false,
      ...(cursor && {
        id: {
          lt: cursor,
        },
      }),
    },
    select: {
      id: true,
      content: true,
      votesCount: true,
      createdAt: true,
      idea: {
        select: {
          id: true,
          title: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy,
    take: limit + 1,
  });

  const hasNextPage = comments.length > limit;
  const results = hasNextPage ? comments.slice(0, -1) : comments;

  return {
    comments: results,
    nextCursor: hasNextPage ? results[results.length - 1].id : null,
  };
}

export async function getUserUpvotes(
  userId: string,
  cursor?: string,
  limit = 10,
  sortBy: "latest" | "top" = "latest"
): Promise<{ votes: ProfileVote[]; nextCursor: string | null }> {
  const orderBy = sortBy === "latest" 
    ? { createdAt: "desc" as const }
    : { idea: { votesCount: "desc" as const } };

  const votes = await prisma.votes.findMany({
    where: {
      userId,
      type: "UP",
      ...(cursor && {
        id: {
          lt: cursor,
        },
      }),
    },
    select: {
      id: true,
      type: true,
      createdAt: true,
      idea: {
        select: {
          id: true,
          title: true,
          votesCount: true,
          author: {
            select: {
              username: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy,
    take: limit + 1,
  });

  const hasNextPage = votes.length > limit;
  const results = hasNextPage ? votes.slice(0, -1) : votes;

  return {
    votes: results,
    nextCursor: hasNextPage ? results[results.length - 1].id : null,
  };
}

export async function getUserDownvotes(
  userId: string,
  cursor?: string,
  limit = 10,
  sortBy: "latest" | "top" = "latest"
): Promise<{ votes: ProfileVote[]; nextCursor: string | null }> {
  const orderBy = sortBy === "latest" 
    ? { createdAt: "desc" as const }
    : { idea: { votesCount: "desc" as const } };

  const votes = await prisma.votes.findMany({
    where: {
      userId,
      type: "DOWN",
      ...(cursor && {
        id: {
          lt: cursor,
        },
      }),
    },
    select: {
      id: true,
      type: true,
      createdAt: true,
      idea: {
        select: {
          id: true,
          title: true,
          votesCount: true,
          author: {
            select: {
              username: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy,
    take: limit + 1,
  });

  const hasNextPage = votes.length > limit;
  const results = hasNextPage ? votes.slice(0, -1) : votes;

  return {
    votes: results,
    nextCursor: hasNextPage ? results[results.length - 1].id : null,
  };
}
