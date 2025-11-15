import { Button } from "@/components/ui/button";
import { ArrowBigDownDash, ArrowBigUpDash } from "lucide-react";
import React, { useState } from "react";
import CommentForm from "./CommentForm";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import axios from "axios";

const Comment = ({ comment, ideaId }: { comment: any; ideaId: string }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replies, setReplies] = useState([]);
  const fetchReplies = async () => {
    // Logic to fetch and display replies can be added here
    try {
        const res = await axios.get(`/api/comment/replies`, {
          params: { commentId: comment.id },
        });

        if (res.status === 200) {
          setReplies(res.data);
        }

    } catch (error) {
        
    }
  }
  return (
    <div
      key={comment.id}
      className={cn(
        "border-b border-border/50 py-2 space-y-1",
        comment.commentId && "ml-12"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="shrink-0">
          <Avatar>
            <AvatarFallback>
              {comment.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
            <AvatarImage src={comment.user.image} />
          </Avatar>
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">
              {comment.user.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{comment.content}</p>
        </div>
      </div>
      <div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground mr-4 hover:text-green-600"
          >
            <ArrowBigUpDash size={20} />
          </Button>
          <span className="text-sm text-center">{comment.votesCount}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground mr-4 hover:text-orange-600"
          >
            <ArrowBigDownDash size={20} />
          </Button>
        </div>
        {comment._count.replies > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={fetchReplies}>
            Show Replies ({comment._count.replies})
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setIsReplying(!isReplying)}
        >
          Reply
        </Button>
      </div>
      {isReplying && (
        <CommentForm ideaId={ideaId} commentId={comment.id} isReply={true}  />
      )}
      {
        replies.length > 0 && replies.map((reply: any) => (
            <Comment key={reply.id} comment={reply} ideaId={ideaId} />
        ))
      }
    </div>
  );
};

export default Comment;
