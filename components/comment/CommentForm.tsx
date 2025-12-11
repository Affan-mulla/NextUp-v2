/**
 * Comment Form Component
 * React Hook Form + Framer Motion with stable focus behavior
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserField } from "@/lib/store/user-store";
import { useCreateComment } from "@/lib/hooks/use-comment-query";
import type { CommentFormValues, CommentFormProps } from "@/types/comment";

export default function CommentForm({
  ideaId,
  parentId,
  onSuccess,
  placeholder,
  setIsOpen,
  autoFocus = false,
}: CommentFormProps) {
  const [isExpanded, setIsExpanded] = useState(autoFocus);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const avatar = useUserField("avatar");
  const username = useUserField("name");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<CommentFormValues>({
    defaultValues: {
      content: "",
    },
  });

  const content = watch("content");
  const createCommentMutation = useCreateComment(ideaId, parentId);

  // Get ref from register
  const { ref: registerRef, ...registerRest } = register("content", {
    required: "Comment cannot be empty",
    maxLength: {
      value: 2000,
      message: "Comment is too long (max 2000 characters)",
    },
  });

  // Merge refs callback
  const setTextareaRef = useCallback(
    (element: HTMLTextAreaElement | null) => {
      registerRef(element);
      textareaRef.current = element;
    },
    [registerRef]
  );

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setIsExpanded(true);
    if(parentId) {
      setIsOpen?.(true);
    }
  };

  const handleCancel = () => {
    reset();
    setIsExpanded(false);
    textareaRef.current?.blur();
    if(parentId) {
      setIsOpen?.(false);
    }
  };

  const onSubmit = async (data: CommentFormValues) => {
    if (!data.content.trim()) return;

    await createCommentMutation.mutateAsync(
      {
        content: data.content,
        ideaId,
        ...(parentId && { commentId: parentId }),
      },
      {
        onSuccess: () => {
          reset();
          setIsExpanded(false);
          textareaRef.current?.blur();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className={parentId ? "mt-2 ml-8" : "mt-4"}
    >
      <div
        className={`rounded-2xl ${
          parentId ? "bg-background/50" : "bg-card/20"
        } shadow-sm border border-border/60 overflow-hidden transition-all ${
          isExpanded ? "ring-2 ring-primary/30" : ""
        }`}
      >
        <div className="flex items-start w-full gap-3 px-3 py-3">
          <Avatar className="h-8 w-8 shrink-0 mt-1">
              <AvatarImage src={avatar} alt={username || "User"} className="object-cover" />
              <AvatarFallback>
                {username?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <textarea
              ref={setTextareaRef}
              placeholder={placeholder || (parentId ? "Write a reply..." : "Write a comment...")}
              {...registerRest}
              onFocus={handleFocus}
              rows={1}
              className="w-full px-4 py-2 text-sm bg-background focus:outline-none rounded-xl border border-border resize-none transition-all min-h-10 max-h-[300px]"
              disabled={createCommentMutation.isPending}
            />
            
            {errors.content && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {errors.content.message}
              </p>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex gap-2 items-center justify-end w-full px-3 pb-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {content.length}/2000
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 px-3"
                  onClick={handleCancel}
                  disabled={createCommentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs h-8 px-3 gap-1.5"
                  disabled={!content.trim() || createCommentMutation.isPending}
                >
                  {createCommentMutation.isPending ? (
                    <>
                      <Spinner className="h-3 w-3" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      {parentId ? "Reply" : "Comment"}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
