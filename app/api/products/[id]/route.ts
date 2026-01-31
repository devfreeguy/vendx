import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { createErrorResponse } from "@/lib/api-error";
import { updateProductSchema } from "@/lib/schemas";
import { deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { vendor: { select: { id: true, email: true } } },
    });

    if (!product) {
      return createErrorResponse("Product not found", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error("GET /api/products/[id] error:", error);
    return createErrorResponse(
      "Failed to fetch product",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "VENDOR") {
    return createErrorResponse(
      "Forbidden: Only vendors can update products",
      403,
      "FORBIDDEN",
    );
  }

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return createErrorResponse("Product not found", 404, "NOT_FOUND");
    }

    if (product.vendorId !== session.userId) {
      return createErrorResponse(
        "Unauthorized: You do not own this product",
        403,
        "FORBIDDEN",
      );
    }

    const body = await req.json();
    const validated = updateProductSchema.parse(body);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    console.error("PATCH /api/products/[id] error:", error);
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
      "Failed to update product",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "VENDOR") {
    return createErrorResponse(
      "Forbidden: Only vendors can delete products",
      403,
      "FORBIDDEN",
    );
  }

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return createErrorResponse("Product not found", 404, "NOT_FOUND");
    }

    if (product.vendorId !== session.userId) {
      return createErrorResponse(
        "Unauthorized: You do not own this product",
        403,
        "FORBIDDEN",
      );
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      try {
        await Promise.all(
          product.images.map(async (imageUrl) => {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          }),
        );
      } catch (imageError) {
        console.error("Failed to delete images from Cloudinary", imageError);
        // Continue with product deletion even if image cleanup fails
      }
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return createErrorResponse(
      "Failed to delete product",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
