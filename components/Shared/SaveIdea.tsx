import React from "react";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bookmark01Icon } from "@hugeicons/core-free-icons";

const SaveIdea = () => {
  return (
    <Button
      variant={"link"}
      size={"icon-sm"}
      className="border p-2  border-border bg-popover hover:border-primary transition-colors"
    >
      <HugeiconsIcon
        icon={Bookmark01Icon}
        className="size-4 text-foreground "
        strokeWidth={1.5}
      />
    </Button>
  );
};

export default SaveIdea;
