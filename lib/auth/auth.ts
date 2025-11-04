import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../prisma";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    databaseHooks: {
        user: {
            create: {
                before: async (user, ctx) => {
                    // Derive username from email only if client didn't provide one.
                    const derivedUsername = user.username ?? (user.email ? user.email.split("@")[0] : undefined);

                    return {
                        data: {
                            ...user,
                            ...(derivedUsername ? { username: derivedUsername } : {}),
                        },
                    };
                },
            },
        },
    },
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: false,
                unique: true,
            },
        },
    },
    emailAndPassword:{
        enabled: true,
        requireEmailVerification:false,
        minPasswordLength:6,
    },
    
    socialProviders: {
        github:{
            enabled: true,
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    },
});