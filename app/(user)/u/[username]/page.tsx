import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/utils/profile-queries";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowBigUpDash, ArrowBigDownDash } from "lucide-react";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar02Icon,
  File02Icon,
  Message02Icon,
  UserAdd01Icon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserProfile(username);

  if (!profile) return { title: "User Not Found" };

  return {
    title: `${profile.name} (@${profile.username})`,
    description: `View ${profile.name}'s profile.`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const [profile, session] = await Promise.all([
    getUserProfile(username),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!profile) notFound();

  const isOwnProfile = session?.user?.id === profile.id;

  return (
    <div className="flex  container justify-center">
      <div className="container  px-4 py-8 max-w-4xl mx-4">
        <Card className="rounded-xl border bg-card/60 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <Avatar className="h-24 w-24 ring-2 ring-border">
                <AvatarImage
                  src={profile.image || undefined}
                  alt={profile.name}
                />
                <AvatarFallback className="text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Main info */}
              <div className="flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold font-outfit tracking-wide">
                      {profile.name}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      @{profile.username}
                    </p>

                    {/* Join Date */}
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <HugeiconsIcon icon={Calendar02Icon} size={18} />
                      Joined{" "}
                      {new Date(profile.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Action Button */}
                  {isOwnProfile ? (
                    <Link href="/settings/profile">
                      <Button className="bg-linear-to-b from-primary to-secondary/20 via-70%   shadow-md ">
                        <HugeiconsIcon
                          icon={UserEdit01Icon}
                          className="size-5"
                          size={24}
                          strokeWidth={2}
                        />{" "}
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <Button className="bg-linear-to-b from-primary to-secondary/20 via-70%  shadow-md shadow-secondary/50">
                      <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} className="size-5" />
                      Follow
                    </Button>
                  )}
                </div>

                {/* Optional Bio */}
                {profile.bio && (
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 lg:hidden ">
              <Stat
                icon={
                  <HugeiconsIcon
                    icon={File02Icon}
                    size={20}
                    className="text-muted-foreground"
                  />
                }
                label="Posts"
                value={profile._count.ideas}
              />
              <Stat
                icon={
                  <HugeiconsIcon
                    icon={Message02Icon}
                    size={20}
                    className="text-muted-foreground"
                  />
                }
                label="Comments"
                value={profile._count.comments}
              />
              <Stat
                icon={<ArrowBigUpDash className="h-5 w-5 text-green-500" />}
                label="Upvotes"
                value={profile.upvotesReceived}
              />
              <Stat
                icon={<ArrowBigDownDash className="h-5 w-5 text-red-500" />}
                label="Downvotes"
                value={profile.downvotesReceived}
              />
            </div>

          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mt-6">
          <ProfileTabs username={username} isOwnProfile={isOwnProfile} />
        </div>
      </div>

      <div className="p-8 w-full max-w-sm lg:block hidden ">
        <div className="relative max-w-72 w-full h-72 rounded-2xl overflow-hidden  border border-white/15  backdrop-blur shadow ">
          {/* Soft glow accents */}
          <div className="absolute -bottom-20   w-full h-52  bg-primary/25 animate-pulse duration-1000 transition blur-2xl" />
          <div className="absolute -top-10  w-full h-40 rounded-full  bg-muted/10 blur-2xl" />

          {/* Content */}
          <div className="relative z-10 dark:bg-sidebar/20 bg-sidebar/40 h-full p-6  text-center">
            <div>
              <h2 className="text-xl tracking-wide font-bold mb-2 font-outfit ">
                {profile.name}
              </h2>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                @{profile.username} • Joined{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <Stat
                  icon={
                    <HugeiconsIcon
                      icon={File02Icon}
                      size={20}
                      className="text-muted-foreground"
                    />
                  }
                  label="Posts"
                  value={profile._count.ideas}
                />
                <Stat
                  icon={
                    <HugeiconsIcon
                      icon={Message02Icon}
                      size={20}
                      className="text-muted-foreground"
                    />
                  }
                  label="Comments"
                  value={profile._count.comments}
                />
                <Stat
                  icon={<ArrowBigUpDash className="h-5 w-5 text-green-500" />}
                  label="Upvotes"
                  value={profile.upvotesReceived}
                />
                <Stat
                  icon={<ArrowBigDownDash className="h-5 w-5 text-red-500" />}
                  label="Downvotes"
                  value={profile.downvotesReceived}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="">
      <div className="flex justify-center items-center gap-2 text-xl font-semibold">
        {icon}
        {value}
      </div>
      <p className="text-xs text-center text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
