import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        wallet: {
          include: {
            balances: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) {
      return createErrorResponse("User not found", 404, "NOT_FOUND");
    }

    // Fetch recent orders separately to limit
    const recentOrders = await prisma.order.findMany({
      where: { buyerId: session.userId as string },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: {
          select: {
            product: { select: { title: true, images: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  profilePicture: z.string().optional(),
});

import { deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const body = await req.json();
    const { name, currentPassword, newPassword, profilePicture } =
      updateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
    });

    if (!user) {
      return createErrorResponse("User not found", 404, "NOT_FOUND");
    }

    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (name) {
      dataToUpdate.name = name;
    }

    if (profilePicture !== undefined) {
      // If updating profile picture, check if we need to delete the old one
      if (user.profilePicture && user.profilePicture !== profilePicture) {
        const publicId = getPublicIdFromUrl(user.profilePicture);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      dataToUpdate.profilePicture = profilePicture;
    }

    if (newPassword) {
      if (!currentPassword) {
        return createErrorResponse(
          "Current password required to set new password",
          400,
          "VALIDATION_ERROR",
        );
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return createErrorResponse(
          "Incorrect current password",
          400,
          "VALIDATION_ERROR",
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      dataToUpdate.password = hashedPassword;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ success: true, message: "No changes made" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        error.issues[0]?.message || "Validation failed",
        400,
        "VALIDATION_ERROR",
      );
    }
    console.error("PATCH /api/user/profile error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
