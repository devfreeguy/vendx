import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse } from "@/lib/api-error";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!user) {
    return createErrorResponse("User not found", 404, "NOT_FOUND");
  }

  const { password, ...userWithoutPassword } = user;
  return NextResponse.json({ success: true, data: userWithoutPassword });
}
