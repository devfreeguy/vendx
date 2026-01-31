import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admins only" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const where: any = {};
  if (role) {
    where.role = role.toUpperCase();
  }

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true, products: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
