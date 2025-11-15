import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const ideaId = new URL(request.url).searchParams.get("ideaId");
        if(!ideaId) {
            return new Response("Missing ideaId", {status: 400})
        }

        const comments = await prisma.comments.findMany({
            where: {
                ideaId
            },
            select: {
                id: true,
                userId: true,
                content: true,
                createdAt: true,
                commentId: true,
                votesCount: true,
                user:{
                    select:{
                        id: true,
                        username: true,
                        image: true,
                    }
                },
                _count:{
                    select:{
                        replies: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            },
        });
        return new Response(JSON.stringify(comments), {status: 200});
    } catch (error) {
        return new Response("Error fetching comments", {status: 501})   
    }
}