import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/verification";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { error: "Missing token or email" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified", alreadyVerified: true },
        { status: 200 }
      );
    }

    const result = await verifyToken(email, token);

    if (!result.valid) {
      if (result.expired) {
        return NextResponse.json(
          { error: "Token expired", expired: true },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Invalid token", invalid: true },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Email verified successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
