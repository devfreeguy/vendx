import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse } from "@/lib/api-error";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const vendor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        profilePicture: true,
        role: true, // Verification
        createdAt: true,
        products: {
          where: { stock: { gt: 0 } }, // Only active products
          select: {
            id: true,
            title: true,
            price: true,
            discountPrice: true,
            images: true,
            stock: true,
            category: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    if (!vendor || vendor.role !== "VENDOR") {
      return createErrorResponse("Vendor not found", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true, data: vendor });
  } catch (error) {
    console.error("GET /api/vendors/[id] error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
