"use client";

import { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import TabPillNavigation from "../Shared/TabPillNavigation";

const PostsTab = lazy(() => import("./PostsTab"));
const CommentsTab = lazy(() => import("./CommentsTab"));
const UpvotesTab = lazy(() => import("./UpvotesTab"));
const DownvotesTab = lazy(() => import("./DownvotesTab"));

export function ProfileTabs({
  username,
  isOwnProfile,
}: {
  username: string;
  isOwnProfile: boolean;
}) {
  const [activeTab, setActiveTab] = useState("posts");
  const [hoverTab, setHoverTab] = useState<number | null>(null);

  const tabs = [
    { value: "posts", label: "Posts" },
    { value: "comments", label: "Comments" },
  ];

  if (isOwnProfile) {
    tabs.push(
      { value: "upvotes", label: "Upvotes" },
      { value: "downvotes", label: "Downvotes" }
    );
  }

  const glassSpring = {
    type: "spring",
    stiffness: 420,
    damping: 30,
    mass: 0.3,
  } as const;
  const activeSpring = { type: "spring", stiffness: 440, damping: 30 } as const;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabPillNavigation tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* TAB CONTENT */}
      <TabsContent value="posts">
        <Suspense
          fallback={<Loader2 className="animate-spin h-6 w-6 mx-auto" />}
        >
          <PostsTab username={username} />
        </Suspense>
      </TabsContent>

      <TabsContent value="comments">
        <Suspense
          fallback={<Loader2 className="animate-spin h-6 w-6 mx-auto" />}
        >
          <CommentsTab username={username} />
        </Suspense>
      </TabsContent>

      {isOwnProfile && (
        <>
          <TabsContent value="upvotes">
            <Suspense
              fallback={<Loader2 className="animate-spin h-6 w-6 mx-auto" />}
            >
              <UpvotesTab username={username} />
            </Suspense>
          </TabsContent>

          <TabsContent value="downvotes">
            <Suspense
              fallback={<Loader2 className="animate-spin h-6 w-6 mx-auto" />}
            >
              <DownvotesTab username={username} />
            </Suspense>
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}
