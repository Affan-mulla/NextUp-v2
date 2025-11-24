/**
 * Home page - Ideas Feed
 * Server-rendered with React Query hydration for optimal performance
 */

import IdeaWrapper from "@/components/feed/IdeaWrapper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getIdeas } from "@/lib/supabase/ideas";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextUp - Discover Brilliant Ideas",
  description:
    "Explore and share innovative startup ideas. Join the community of builders and dreamers creating the future.",
  openGraph: {
    title: "NextUp - Discover Brilliant Ideas",
    description:
      "Explore and share innovative startup ideas. Join the community of builders and dreamers.",
    type: "website",
  },
};

const Page = async () => {
  const queryClient = new QueryClient();
  
   queryClient.prefetchInfiniteQuery({
    queryKey: ["ideas"],
    queryFn: async () => await getIdeas(),
    initialPageParam: undefined,
  });
 
  return (
    <ScrollArea className="h-full max-h-[calc(100vh-4rem)]">
    <div className="">
      {/* Hydrate the client with server-fetched data */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="space-y-6">
          {/* Ideas Feed */}
            <IdeaWrapper />
        </div>
      </HydrationBoundary>
    </div>
    </ScrollArea>
  );
};

export default Page;
