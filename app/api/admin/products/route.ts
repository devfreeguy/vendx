import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET_KEY =
  process.env.JWT_SECRET || "super-secret-key-change-this-in-env";
const key = new TextEncoder().encode(SECRET_KEY);

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const session = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(session, key);
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch admin products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
