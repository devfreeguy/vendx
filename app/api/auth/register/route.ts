import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createErrorResponse } from "@/lib/api-error";
import { registerSchema } from "@/lib/schemas";
import { sendWelcomeEmail } from "@/lib/email/email-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return createErrorResponse("User already exists", 409, "CONFLICT");
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Exclude raw password from the data to be saved
    const { password: rawPassword, ...userData } = validatedData;

    const user = await prisma.user.create({
      data: {
        id: nanoid(),
        ...userData,
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Send welcome email (non-blocking)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://vendx.store";
    const profileUrl = `${baseUrl}/dashboard`;

    sendWelcomeEmail({
      name: user.name || "there",
      email: user.email,
      profileUrl,
    }).catch((error: any) => {
      console.error("Failed to send welcome email:", error);
      // Don't fail registration if email fails
    });

    return NextResponse.json(
      { success: true, data: userWithoutPassword },
      { status: 201 },
    );
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

    console.error("Registration error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
