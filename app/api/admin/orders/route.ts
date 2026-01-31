import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return createErrorResponse("Forbidden: Admins only", 403, "FORBIDDEN");
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { email: true } },
        items: {
          include: {
            product: {
              select: { title: true, vendor: { select: { email: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
