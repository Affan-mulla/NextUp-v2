import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../prisma";
import { sendVerificationEmail } from "../email";
import { createVerificationToken } from "../utils/verification";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    databaseHooks: {
        user: {
            create: {
                before: async (user, ctx) => {
                    const derivedUsername = user.username ?? (user.email ? user.email.split("@")[0] : undefined);

                    return {
                        data: {
                            ...user,
                            ...(derivedUsername ? { username: derivedUsername } : {}),
                            emailVerified: false,
                        },
                    };
                },
                after: async (user) => {
                    if (user.email) {
                        const token = await createVerificationToken(user.email);
                        await sendVerificationEmail({
                            email: user.email,
                            token,
                        });
                    }
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
            emailVerified: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
        },
    },
    emailAndPassword:{
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 6,
    },
    
    socialProviders: {
        github:{
            enabled: true,
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }
    },

    account : {

        accountLinking : {
            enabled: true,
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    },
});