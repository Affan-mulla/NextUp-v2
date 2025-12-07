import { Comment03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

const CommentBox = ({ commentsCount }: { commentsCount: number | undefined}) => {
  return (
    <div className="flex items-center gap-2 rounded-md h-8 w-12 justify-center border border-border bg-popover hover:border-primary transition-colors">
      <HugeiconsIcon
        icon={Comment03Icon}
        className="size-4 text-muted-foreground "
      />
      <span className="text-sm font-medium">{commentsCount ?? 0}</span>
    </div>
  );
};

export default CommentBox;
