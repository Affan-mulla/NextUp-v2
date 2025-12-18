import { prisma } from "@/lib/prisma";
import {
  ProfileComment,
  ProfilePost,
  ProfileUser,
  ProfileVote,
} from "@/types/profile";

import { cache } from "react";

export const getUserProfile = cache(
  async (username: string): Promise<ProfileUser | null> => {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
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
  }
);

export async function getUserPosts(
  username: string,
  cursor?: string,
  limit = 10,
  sortBy: "latest" | "top" = "latest",
  currentUserId?: string
): Promise<{ posts: ProfilePost[]; nextCursor: string | null }> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return { posts: [], nextCursor: null };
  }

  const orderBy =
    sortBy === "latest"
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
      votes: currentUserId
        ? {
            where: {
              userId: currentUserId,
            },
            select: {
              type: true,
            },
          }
        : false,
      createdAt: true,
      uploadedImages: true,
      author: {
        select: {
          username: true,
          name: true,
          image: true,
        },
      },
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
    posts: results.map((post) => ({
      ...post,
      votes: Array.isArray(post.votes) && post.votes[0] ? post.votes[0].type : undefined,
    })),
    nextCursor: hasNextPage ? results[results.length - 1].id : null,
  };
}

export async function getUserComments(
  username: string,
  cursor?: string,
  limit = 10,
  sortBy: "latest" | "top" = "latest",
  currentUserId?: string
): Promise<{ comments: ProfileComment[]; nextCursor: string | null }> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return { comments: [], nextCursor: null };
  }

  const orderBy =
    sortBy === "latest"
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
      user: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
      idea: {
        select: {
          id: true,
          title: true,
        },
      },
      parent:{
        select:{
          user:{
            select:{
              username:true,
              image:true
            }
          }
        }
      },
      commentId: true,
      votes: currentUserId
        ? {
            where: {
              userId: currentUserId,
            },
            select: {
              type: true,
            },
          }
        : false,
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
    comments: results.map((com) => ({
      ...com,
      votes: Array.isArray(com.votes) && com.votes[0] ? com.votes[0].type : undefined,
    })),
    nextCursor: hasNextPage ? results[results.length - 1].id : null,
  };
}

export async function getUserUpvotes(
  userId: string,
  cursor?: string,
  limit = 10,
  sortBy: "latest" | "top" = "latest"
): Promise<{ votes: ProfileVote[]; nextCursor: string | null }> {
  const orderBy =
    sortBy === "latest"
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
          uploadedImages: true,
          votesCount: true,
           _count:{
            select:{
              comments:true
            }
          },
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
  const orderBy =
    sortBy === "latest"
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
          uploadedImages: true,
          _count: {
            select:{
              comments: true
            }
          },
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
