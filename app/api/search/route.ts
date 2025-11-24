import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const MAX_RESULTS = 5

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""

  if (!q) {
    return NextResponse.json({ users: [], products: [] })
  }

  // Basic spam/over-fetch protection: ignore overly long queries
  if (q.length > 100) {
    return NextResponse.json({ users: [], products: [] })
  }

  const [users, products] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        image: true,
      },
      take: MAX_RESULTS,
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        images: true,
      },
      take: MAX_RESULTS,
    }),
  ])

  const response = {
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      avatar: u.image,
    })),
    products: products.map((p) => ({
      id: p.id,
      title: p.name,
      image: p.images[0] ?? null,
      price: null as number | null, // extend when you add pricing
    })),
  }

  return NextResponse.json(response)
}
