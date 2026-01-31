import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { z } from "zod";
import { createErrorResponse } from "@/lib/api-error";
import { loginSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return createErrorResponse("Invalid credentials", 401, "UNAUTHORIZED");
    }

    await createSession({ userId: user.id, role: user.role });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
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
    console.error("Login API Error:", error);
    return createErrorResponse(
      "Authentication failed",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
