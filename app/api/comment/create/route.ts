import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";

export async function  POST(request: Request) {
    try {
        
        const data = await request.json();

        const session = await auth.api.getSession(request);
        console.log(session);
        
        if(!session?.user || session.user.id != data.userId) {
            return new Response("Unauthorized", {status: 401})
        }

        if(!data.comment || !data.ideaId || !data.userId) {
            return new Response("Missing fields", {status: 400})
        }

        const res = await prisma.comments.create({
            data :{
                ideaId : data.ideaId,
                userId : data.userId,
                content : data.comment,
                ...(data.commentId && {commentId : data.commentId})
            }
        })
        if(!res) {
            return new Response("Error creating idea", {status: 500})
        }

        return new Response(JSON.stringify(res), {status: 200})

    } catch (error) {
        return new Response("Error creating idea", {status: 501})
    }
}