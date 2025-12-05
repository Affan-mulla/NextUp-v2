"use client";

import { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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

  const glassSpring = { type: "spring", stiffness: 420, damping: 30, mass: 0.3 };
  const activeSpring = { type: "spring", stiffness: 540, damping: 34 };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

      <div className="relative h-13 rounded-full p-2 mb-4">

        {/* OUTER SHELL — theme aware */}
        <div
          className="absolute inset-0 rounded-full 
          bg-gradient-to-b from-secondary to-secondary/90
          dark:bg-gradient-to-b dark:from-sidebar dark:to-sidebar/80
          dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        />

        <div
          className="absolute inset-[3px] rounded-full
          bg-gradient-to-b from-card to-card/90
          shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]
          dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
        />

        {/* GLASS FULL-WIDTH */}
        {hoverTab === null && (
          <motion.div
            layoutId="glass"
            transition={glassSpring}
            className="absolute inset-[6px] rounded-full 
            bg-foreground/5 dark:bg-foreground/10 
            backdrop-blur-sm border border-border/40
            dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)] z-10"
          />
        )}

        {/* TABS */}
        <div className="relative z-20 grid h-full grid-cols-4">
          {tabs.map((tab, idx) => {
            const isActive = tab.value === activeTab;
            const isHover = hoverTab === idx;

            return (
              <button
                key={tab.value}
                onPointerEnter={() => setHoverTab(idx)}
                onPointerLeave={() => setHoverTab(null)}
                onClick={() => setActiveTab(tab.value)}
                aria-pressed={isActive}
                className="relative flex items-center justify-center cursor-pointer select-none"
              >
                {/* GLASS FOLLOW PILL */}
                {isHover && (
                  <motion.div
                    layoutId="glass"
                    transition={glassSpring}
                    className="absolute inset-0 rounded-full 
                    bg-foreground/5 dark:bg-foreground/10
                    backdrop-blur-sm border border-border/40 
                    dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)] z-10"
                  />
                )}

                {/* ACTIVE PILL */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    transition={activeSpring}
                    className="absolute inset-1 rounded-full 
                    bg-gradient-to-b  h-full top-0
                    from-primary/90 to-primary 
                    dark:from-primary/80 dark:to-primary/90
                    
                    border border-border/40 z-20"
                  />
                )}

                {/* LABEL */}
                <span
                  className={`relative z-30 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "text-primary-foreground dark:text-primary-foreground"
                    : "text-muted-foreground"
                }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <TabsContent value="posts">
        <Suspense fallback={<Loader2 className="animate-spin h-6 w-6 mx-auto" />}>
          <PostsTab username={username} />
        </Suspense>
      </TabsContent>

      <TabsContent value="comments">
        <Suspense fallback={<Loader2 className="animate-spin h-6 w-6 mx-auto" />}>
          <CommentsTab username={username} />
        </Suspense>
      </TabsContent>

      {isOwnProfile && (
        <>
          <TabsContent value="upvotes">
            <Suspense fallback={<Loader2 className="animate-spin h-6 w-6 mx-auto" />}>
              <UpvotesTab username={username} />
            </Suspense>
          </TabsContent>

          <TabsContent value="downvotes">
            <Suspense fallback={<Loader2 className="animate-spin h-6 w-6 mx-auto" />}>
              <DownvotesTab username={username} />
            </Suspense>
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}
