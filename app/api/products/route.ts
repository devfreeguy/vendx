import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createErrorResponse } from "@/lib/api-error";
import { productSchema } from "@/lib/schemas";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category");
  const subCategory = searchParams.get("subCategory");
  const vendorId = searchParams.get("vendorId");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const where: Prisma.ProductWhereInput = {};

  if (category) where.category = category;
  if (subCategory) where.subcategory = subCategory;
  if (vendorId) where.vendorId = vendorId;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          vendor: {
            select: { id: true, email: true, name: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return createErrorResponse(
      "Failed to fetch products",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session || session.role !== "VENDOR") {
    return createErrorResponse(
      "Forbidden: Vendors only can create products",
      403,
      "FORBIDDEN",
    );
  }

  try {
    const body = await req.json();
    const validated = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        id: nanoid(),
        ...validated,
        vendorId: session.userId as string,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return createErrorResponse(
        `Validation failed: ${fieldErrors.join(", ")}`,
        400,
        "VALIDATION_ERROR",
      );
    }
    if (error.code === "P2002") {
      return createErrorResponse(
        "A product with this SKU already exists.",
        409,
        "CONFLICT",
      );
    }
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
