import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse } from "@/lib/api-error";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const body = await request.json();
    const { name, profilePicture } = body;

    const user = await prisma.user.update({
      where: { id: session.userId as string },
      data: {
        name,
        profilePicture,
        onboardingCompleted: true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return createErrorResponse(
      error?.message || "Failed to update profile",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
