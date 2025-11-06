/**
 * Rich Text Editor Component Wrapper
 * Integrates Lexical editor for the Create Idea form
 */

"use client";

import { SerializedEditorState } from "lexical";
import { memo, useCallback } from "react";
import { Editor } from "@/components/blocks/editor-x/editor";

interface RichTextEditorProps {
  value: SerializedEditorState;
  onChange: (state: SerializedEditorState) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Wrapper around the Lexical editor
 * Handles state management and callbacks
 */
export const RichTextEditor = memo(
  ({
    value,
    onChange,
    placeholder = "Enter idea description...",
    disabled = false,
  }: RichTextEditorProps) => {
    const handleStateChange = useCallback(
      (newState: SerializedEditorState) => {
        onChange(newState);
      },
      [onChange]
    );

    return (
      <div className="relative w-full rounded-lg border border-input bg-background">
        <Editor
          editorSerializedState={value}
          onSerializedChange={handleStateChange}
        />
        {disabled && (
          <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center cursor-not-allowed">
            <span className="text-sm text-muted-foreground">
              Editor is disabled
            </span>
          </div>
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
