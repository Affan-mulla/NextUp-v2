import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigDownDash, ArrowBigUpDash } from "lucide-react";
import { useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import Comment from "./Comment";

const CommentSection = ({ ideaId }: { ideaId: string }) => {
  const [comments, setComments] = useState([]);
 

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/comment/get`, {
        params: { ideaId },
      });
      if (res.status === 200) {
        setComments(res.data);
      }
    } catch (error) {
      setComments([]);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [ideaId, comments.length]);

  if (comments.length === 0) {
    return <div>No comments yet.</div>;
  }

  return (
    <div>
      {comments.map((comment: any) => (
       <Comment key={comment.id} comment={comment} ideaId={ideaId} />
      ))}
    </div>
  );
};

export default CommentSection;
