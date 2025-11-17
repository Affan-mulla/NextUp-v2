import { getIdeaById } from "@/lib/supabase/ideas";
import { Metadata } from "next";
import IdeaDetailClient from "./_components/Idea/IdeaDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const idea = await getIdeaById(id);

    return {
      title: `${idea.title} - NextUp`,
      description: idea.title,
    };
  } catch {
    return {
      title: "Idea Not Found - NextUp",
    };
  }
}

const IdeaPage = async ({ params }: PageProps) => {
  const { id } = await params;

  // Server-side rendering for SEO and initial data
  // Client component will handle cache-first then DB fallback
  return <IdeaDetailClient id={id} />;
};

export default IdeaPage;
