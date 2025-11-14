"use client";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  return (
    <Button variant={"ghost"} size={"icon"} onClick={() => router.back()}>
      <HugeiconsIcon icon={ArrowLeft02Icon} />
    </Button>
  );
};

export default BackButton;
