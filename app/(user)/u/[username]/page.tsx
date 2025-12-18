import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/utils/profile-queries";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowBigUpDash, ArrowBigDownDash } from "lucide-react";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File02Icon,
  Message02Icon,
  UserAdd01Icon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import ProfileCard from "@/components/profile/ProfileCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <div className="flex  container justify-center relative">
      <div className="container  md:px-4 py-8 max-w-4xl md:mx-4">
        <div className="flex gap-6 items-start px-4 sm:px-0">
          {/* Avatar */}
          <Avatar className="md:h-24 md:w-24 h-18 w-18 ring-2 ring-border ">
            <AvatarImage src={profile.image || undefined} alt={profile.name} />
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

              </div>

              {/* Action Button */}
              {isOwnProfile ? (
                <Link href="/settings/general">
                  <Button variant={"default"}>
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
                <Button
                  variant={"default"}
                  className="bg-linear-to-b from-primary to-secondary/20 via-70%  shadow-md shadow-secondary/50"
                >
                  <HugeiconsIcon
                    icon={UserAdd01Icon}
                    strokeWidth={2}
                    className="size-5"
                  />
                  Follow
                </Button>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="px-4">
          <Accordion
            type="single"
            collapsible
            className="w-full  md:hidden bg-popover rounded-lg px-6 mt-4"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-muted-foreground">About {profile.name}</AccordionTrigger>
              <AccordionContent>
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        {/* Tabs */}
        <div className="mt-6 ">
          <ProfileTabs username={username} isOwnProfile={isOwnProfile} />
        </div>
      </div>

      <ProfileCard profile={profile} />
    </div>
  );
}
// Stat Component
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
