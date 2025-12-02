"use client";

import { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const PostsTab = lazy(() => import("./PostsTab"));
const CommentsTab = lazy(() => import("./CommentsTab"));
const UpvotesTab = lazy(() => import("./UpvotesTab"));
const DownvotesTab = lazy(() => import("./DownvotesTab"));

interface ProfileTabsProps {
  username: string;
  isOwnProfile: boolean;
}

const TabLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

export function ProfileTabs({ username, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("posts");

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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <AnimatePresence>
        <TabsList className="relative grid w-full grid-cols-4 bg-sidebar/70 shadow backdrop-blur h-10 border border-muted rounded-md p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <div key={tab.value} className="relative">
                {/* Slide highlight */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 rounded-md  bg-linear-to-b from-orange-200 to-orange-100 dark:bg-linear-to-b dark:from-primary/40 dark:to-primary/10   backdrop-blur-md "
                  />
                )}

                <TabsTrigger
                  value={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className="relative z-10 w-full bg-transparent font-medium data-[state=active]:text-primary data-[state=active]:bg-transparent dark:data-[state=active]:text-primary dark:data-[state=active]:bg-transparent border-0"
                >
                  {tab.label}
                </TabsTrigger>
              </div>
            );
          })}
        </TabsList>
      </AnimatePresence>
      <TabsContent value="posts" className="mt-6">
        <Suspense fallback={<TabLoader />}>
          <PostsTab username={username} />
        </Suspense>
      </TabsContent>

      <TabsContent value="comments" className="mt-6">
        <Suspense fallback={<TabLoader />}>
          <CommentsTab username={username} />
        </Suspense>
      </TabsContent>

      {isOwnProfile && (
        <>
          <TabsContent value="upvotes" className="mt-6">
            <Suspense fallback={<TabLoader />}>
              <UpvotesTab username={username} />
            </Suspense>
          </TabsContent>

          <TabsContent value="downvotes" className="mt-6">
            <Suspense fallback={<TabLoader />}>
              <DownvotesTab username={username} />
            </Suspense>
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}
