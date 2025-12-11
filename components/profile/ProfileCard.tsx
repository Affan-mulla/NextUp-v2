import React from 'react';
import { ArrowBigUpDash, ArrowBigDownDash } from 'lucide-react'; 
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, File02Icon, Message02Icon } from '@hugeicons/core-free-icons';

import { timeAgo } from '@/lib/utils/time'; // Keep your imports
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ProfileUser } from '@/types/profile';

const ProfileCard = ({ profile }: { profile: ProfileUser }) => {
  return (
    <div className="p-8 w-full max-w-sm lg:block hidden group perspective-1000">
      <div
        className="fixed w-[300px] overflow-hidden rounded-2xl
         bg-foreground/5 dark:bg-foreground/10
       
        backdrop-blur-2xl
        ring-2 ring-foreground/10
       
        shadow-[0_10px_20px_-15px_rgba(0,0,0,.2),inset_0_1px_0_0_rgba(255,255,255,0.5)]
        dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]"
      >
        {/* --- LIGHTING EFFECTS --- */}
        
        {/* 1. Brand Spotlight (Top Center) - Ties into your Orange Theme */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-orange-500/20 blur-2xl dark:bg-orange-500/10" />

        {/* --- CONTENT LAYER --- */}
        <div className="relative z-10 p-6 flex flex-col items-center">

          {/* Avatar Section */}
          <div className="relative mb-5 group/avatar">
               {/* Animated Ring on Hover */}
               <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-500/0 via-orange-500/50 to-orange-500/0 opacity-0 group-hover/avatar:opacity-100 blur-sm transition-opacity duration-500" />
               
               <Avatar className="relative h-24 w-24 rounded-full 
                 bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 
                 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
                 border border-white dark:border-zinc-700
                 flex items-center justify-center text-3xl font-bold text-zinc-400 dark:text-zinc-500">
                    <AvatarImage src={profile.image || undefined} alt={profile.name} className='h-24 w-24 rounded-full select-none' draggable={false} />

                  
               <AvatarFallback >{profile.username.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
          </div>

          {/* User Info */}
          <div className="text-center w-full">
            <h1 className="text-2xl font-bold font-outfit tracking-wide">
              {profile.name}
            </h1>
            
            <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-sm font-medium text-primary dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 px-3 py-1 rounded-full">
                    @{profile.username}
                </span>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-400 mt-3">
              <HugeiconsIcon icon={Calendar02Icon} size={14} />
              <span>Joined {timeAgo(new Date(profile.createdAt))}</span>
            </p>
          </div>

          {/* Refined Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent  my-6" />

          {/* Stats Grid - Now looks like engraved tiles */}
          <div className="w-full grid grid-cols-2 gap-3">
            <StatBox 
                icon={<HugeiconsIcon icon={File02Icon} size={18} className='text-muted-foreground' />} 
                label="Posts" 
                value={profile._count.ideas} 
            />
            <StatBox 
                icon={<HugeiconsIcon icon={Message02Icon} size={18} className='text-muted-foreground' />} 
                label="Comments" 
                value={profile._count.comments} 
                
            />
            <StatBox 
                icon={<ArrowBigUpDash className="h-5 w-5 fill-current" />} 
                label="Upvotes" 
                value={profile.upvotesReceived} 
                accentColor="text-green-500 "
            />
            <StatBox 
                icon={<ArrowBigDownDash className="h-5 w-5 fill-current" />} 
                label="Downvotes" 
                value={profile.downvotesReceived} 
                accentColor="text-red-500 "
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Component
interface StatBoxProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    accentColor?: string;
}

const StatBox = ({ icon, label, value, accentColor }: StatBoxProps) => (
  <div className=" relative flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all duration-300
    bg-popover 
    border border-border
    hover:bg-popover/70 

    shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-none"
  >
    <div className={` flex gap-1 ${accentColor}`}>
        {icon}
        <span className="text-lg font-bold font-outfit leading-none tracking-tight">
      {new Intl.NumberFormat('en-US', { notation: "compact" }).format(value)}
    </span>
    </div>
    
    
    
    <span className="text-xs text-muted-foreground font-semibold mt-1">
      {label}
    </span>
  </div>
);

export default ProfileCard;