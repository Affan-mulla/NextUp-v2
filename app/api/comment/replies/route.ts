import prisma from "@/lib/prisma";

export async function GET(request: Request) {  
    try {
        const commentId = new URL(request.url).searchParams.get("commentId");
        if(!commentId) {
            return new Response("Missing commentId", {status: 400})
        }

        const comments = await prisma.comments.findMany({
            where: {
                commentId: commentId,
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
            }
        })
        return new Response(JSON.stringify(comments), {status: 200})
    } catch (error) {
        console.log(error)
        return new Response("Error getting replies", {status: 500}) 
    }
 }