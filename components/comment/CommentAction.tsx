import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  MoreVerticalCircle01Icon,
  PencilEdit01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useDeleteComment } from "@/lib/hooks/use-comment-query";
import { useState } from "react";

const CommentAction = ({
  commentId,
  ideaId,
  onEditClick,
}: {
  commentId: string;
  ideaId: string;
  onEditClick: () => void;
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { mutate: deleteComment, isPending: isDeletePending } = useDeleteComment(ideaId);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onEditClick();
  };

  const handleDeleteConfirm = () => {
    deleteComment(
      { commentId },
      {
        onSuccess: () => {
          setIsAlertOpen(false);
        },
      }
    );
  };
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <HugeiconsIcon icon={MoreVerticalCircle01Icon} size={"5px"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right">
          <DropdownMenuItem className="gap-2" onClick={handleEditClick}>
            <HugeiconsIcon icon={PencilEdit02Icon} /> Edit
          </DropdownMenuItem>

          <div className="w-full">
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  variant="destructive" 
                  onSelect={(e) => e.preventDefault()}
                >
                  <HugeiconsIcon icon={Delete02Icon} /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the comment as deleted. The comment will show as "[deleted]" in the thread.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletePending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteConfirm}
                    disabled={isDeletePending}
                  >
                    {isDeletePending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CommentAction;
