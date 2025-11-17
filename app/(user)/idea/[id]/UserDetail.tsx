import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dot } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils/time";

interface IdeaProps {
  username: string;
  time: string;
  avatar: string | null;
}

/**
 * User Detail Component
 * Displays user avatar, username, and relative time
 */
const UserDetail = ({ username, time, avatar }: IdeaProps) => {
  return (
    <div className="flex items-center gap-3 font-inter">
      <Link href={`/u/${username}`} className="shrink-0">
        <Avatar className="h-9 w-9 border border-border">
          <AvatarImage src={avatar || undefined} alt={`@${username}`} />
          <AvatarFallback className="bg-muted text-xs">
            {username.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1">
          <Link
            href={`/u/${username}`}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            @{username}
          </Link>

          <Dot className="text-muted-foreground h-4 w-4" aria-hidden="true" />

          <time 
            className="text-xs text-muted-foreground"
            dateTime={time}
          >
            {timeAgo(time)}
          </time>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
