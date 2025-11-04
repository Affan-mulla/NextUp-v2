import { ArrowBigUpDash } from "lucide-react";
import Link from "next/link";

const Title = ({ className}:{className?:string}) => {
  return (
    <Link href="/" className={`text-2xl flex items-center justify-center gap-2 ${className}`}>
      <ArrowBigUpDash
        size={25}
        className=" bg-primary rounded text-white p-1"
      />
      <h1 className="font-outfit">NextUp</h1>
    </Link>
  );
};

export default Title;
