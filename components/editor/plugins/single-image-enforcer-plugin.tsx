"use client"

/**
 * Single Image Enforcer Plugin
 * 
 * Enforces a strict one-image limit in the Lexical editor.
 * Prevents multiple images from being inserted via:
 * - Direct INSERT_IMAGE_COMMAND
 * - Paste operations
 * - Drag & drop
 * - Any programmatic insertion
 * 
 * Shows a user-friendly error message when the limit is exceeded.
 * This prevents large base64 strings from bloating the API/database.
 */

import { useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from "lexical"
import { $isImageNode, ImageNode } from "@/components/editor/nodes/image-node"
import { INSERT_IMAGE_COMMAND } from "@/components/editor/plugins/images-plugin"
import { mergeRegister } from "@lexical/utils"
import { toast } from "sonner"

/**
 * Count existing image nodes in the editor
 */
function $countImageNodes(): number {
  const root = $getRoot()
  let count = 0

  function traverse(node: any): void {
    if ($isImageNode(node)) {
      count++
    }
    
    const children = node.getChildren?.()
    if (children) {
      children.forEach((child: any) => traverse(child))
    }
  }

  traverse(root)
  return count
}

/**
 * Check if clipboard contains image data
 */
function clipboardHasImage(event: ClipboardEvent): boolean {
  const items = event.clipboardData?.items
  if (!items) return false

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      return true
    }
  }
  return false
}

/**
 * Show error toast to user
 */
function showImageLimitError(): void {
  toast.error("Image Limit Reached", {
    description: "Only one image is allowed in the editor. Use the image upload section for more.",
    duration: 4000,
  })
}

export interface SingleImageEnforcerPluginProps {
  /**
   * Maximum number of images allowed (default: 1)
   */
  maxImages?: number
  
  /**
   * Custom error message (optional)
   */
  errorMessage?: string
}

/**
 * Plugin that enforces a single image limit in the editor
 * 
 * Usage:
 * ```tsx
 * <SingleImageEnforcerPlugin maxImages={1} />
 * ```
 */
export function SingleImageEnforcerPlugin({
  maxImages = 1,
  errorMessage,
}: SingleImageEnforcerPluginProps = {}): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      console.warn("SingleImageEnforcerPlugin: ImageNode not registered on editor")
      return
    }

    return mergeRegister(
      // ============================================================
      // 1. Block INSERT_IMAGE_COMMAND if limit reached
      // ============================================================
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageCount = editor.getEditorState().read(() => $countImageNodes())
          
          if (imageCount >= maxImages) {
            console.log(
              `[SingleImageEnforcer] Blocked image insert. Current: ${imageCount}, Max: ${maxImages}`
            )
            
            if (errorMessage) {
              toast.error("Image Limit Reached", {
                description: errorMessage,
                duration: 4000,
              })
            } else {
              showImageLimitError()
            }
            
            return true // Prevent the command from executing
          }

          // Allow the insert - don't handle it, let the default handler proceed
          return false
        },
        COMMAND_PRIORITY_HIGH // Run before the default image plugin handler
      ),

      // ============================================================
      // 2. Block paste operations with images if limit reached
      // ============================================================
      editor.registerCommand(
        PASTE_COMMAND,
        (event: ClipboardEvent) => {
          const imageCount = editor.getEditorState().read(() => $countImageNodes())
          
          // Only intercept if we're at the limit AND paste contains images
          if (imageCount >= maxImages && clipboardHasImage(event)) {
            console.log(
              `[SingleImageEnforcer] Blocked image paste. Current: ${imageCount}, Max: ${maxImages}`
            )
            
            event.preventDefault()
            
            if (errorMessage) {
              toast.error("Image Limit Reached", {
                description: errorMessage,
                duration: 4000,
              })
            } else {
              showImageLimitError()
            }
            
            return true // Prevent paste
          }

          return false // Allow paste
        },
        COMMAND_PRIORITY_HIGH // Run before other paste handlers
      ),

      // ============================================================
      // 3. Monitor editor updates and remove excess images
      // ============================================================
      editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
        // Only check if something changed
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
          return
        }

        editorState.read(() => {
          const imageCount = $countImageNodes()
          
          // If somehow more than max images exist (shouldn't happen, but safety check)
          if (imageCount > maxImages) {
            console.warn(
              `[SingleImageEnforcer] Detected ${imageCount} images (max: ${maxImages}). This should not happen.`
            )
            
            // Show warning to user
            toast.warning("Too Many Images", {
              description: `Please remove ${imageCount - maxImages} image(s). Only ${maxImages} allowed.`,
              duration: 5000,
            })
          }
        })
      })
    )
  }, [editor, maxImages, errorMessage])

  return null
}

/**
 * Hook to check if user can insert an image
 * 
 * Usage:
 * ```tsx
 * const canInsertImage = useCanInsertImage()
 * 
 * <Button 
 *   onClick={handleInsert} 
 *   disabled={!canInsertImage}
 * >
 *   Insert Image
 * </Button>
 * ```
 */
export function useCanInsertImage(maxImages: number = 1): boolean {
  const [editor] = useLexicalComposerContext()
  const [canInsert, setCanInsert] = useState(true)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const imageCount = $countImageNodes()
        setCanInsert(imageCount < maxImages)
      })
    })
  }, [editor, maxImages])

  return canInsert
}

/**
 * Hook to get current image count
 * 
 * Usage:
 * ```tsx
 * const imageCount = useImageCount()
 * 
 * <p>Images: {imageCount} / 1</p>
 * ```
 */
export function useImageCount(): number {
  const [editor] = useLexicalComposerContext()
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Initial count
    editor.getEditorState().read(() => {
      setCount($countImageNodes())
    })

    // Update on changes
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        setCount($countImageNodes())
      })
    })
  }, [editor])

  return count
}
