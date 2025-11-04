import Image from "next/image";
import { Button } from "../ui/button";

const GithubBtn = ({ githubHandler, className }: { githubHandler: () => void, className?: string }) => {
  return (
    <Button
      variant="outline"
      className={`border border-border font-inter w-full ${className}`}
      type="button"
      onClick={githubHandler}
    >
      GitHub
      <Image
        src="/github-light.svg"
        alt="github"
        width={20}
        height={20}
        className="ml-2"
      />
    </Button>
  );
};

export default GithubBtn;
