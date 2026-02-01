import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";
import { deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return createErrorResponse("Forbidden: Admins only", 403, "FORBIDDEN");
  }

  const { id } = await params;

  try {
    // Fetch data to clean up images later
    const user = await prisma.user.findUnique({
      where: { id },
      select: { profilePicture: true },
    });

    const vendorProducts = await prisma.product.findMany({
      where: { vendorId: id },
      select: { images: true },
    });

    // Transaction delete.
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { order: { buyerId: id } } }), // Delete items in buyer's orders
      prisma.order.deleteMany({ where: { buyerId: id } }), // Delete buyer's orders
      prisma.orderItem.deleteMany({ where: { product: { vendorId: id } } }), // Delete items referring to vendor's products
      prisma.product.deleteMany({ where: { vendorId: id } }), // Delete vendor's products
      prisma.user.delete({ where: { id } }),
    ]);

    // Cleanup Cloudinary Assets
    try {
      const cleanupPromises: Promise<any>[] = [];

      // 1. Delete Profile Picture
      if (user?.profilePicture) {
        const publicId = getPublicIdFromUrl(user.profilePicture);
        if (publicId) cleanupPromises.push(deleteFromCloudinary(publicId));
      }

      // 2. Delete Product Images
      vendorProducts.forEach((product: { images: string[] }) => {
        if (product.images && product.images.length > 0) {
          product.images.forEach((img) => {
            const publicId = getPublicIdFromUrl(img);
            if (publicId) cleanupPromises.push(deleteFromCloudinary(publicId));
          });
        }
      });

      if (cleanupPromises.length > 0) {
        await Promise.allSettled(cleanupPromises);
      }
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup Cloudinary assets after user deletion",
        cleanupError,
      );
      // We do not fail the request here, as the DB operation succeeded
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return createErrorResponse(
      "Failed to delete user. Ensure data integrity.",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
