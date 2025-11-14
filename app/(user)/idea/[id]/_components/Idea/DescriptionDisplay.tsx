"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { SerializedEditorState, LexicalEditor } from "lexical";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { nodes as customNodes } from "@/components/blocks/editor-x/nodes";
import { editorTheme } from "@/components/editor/themes/editor-theme";

interface Props {
  content: SerializedEditorState | undefined;
}

const WrapperDescriptionDisplay = ({ content }: Props) => {
  const initialConfig = {
    namespace: "DescriptionViewer",
    theme: editorTheme,
    editable: false,
    onError(error: Error) {
      console.error("Lexical Editor Error:", error);
    },
    editorState: (editor: LexicalEditor) => {
      if (!content) return;
      try {
        const parsed = editor.parseEditorState(content);
        editor.setEditorState(parsed);
      } catch (err) {
        console.error("Failed loading editor state", err);
      }
    },
    nodes: customNodes,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ReadOnlyDescription />
    </LexicalComposer>
  );
};

export default WrapperDescriptionDisplay;

const placeholder = "";

const ReadOnlyDescription = () => {
  return (
    <div className="w-full">
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            aria-label="Description"
            className="ContentEditable__root w-full focus:outline-none"
            placeholder={placeholder}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <ListPlugin />
      <LinkPlugin />
    </div>
  );
};


