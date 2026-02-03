import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { createErrorResponse } from "@/lib/api-error";
import { sendPasswordResetEmail } from "@/lib/email/email-service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  console.log("🔍 Forgot password endpoint called");
  try {
    const body = await req.json();
    console.log("📧 Email from request:", body.email);
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate secure random token
      const resetToken = nanoid(32);
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Token expires in 15 minutes
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Store token in database
      await prisma.passwordResetToken.create({
        data: {
          id: nanoid(),
          userId: user.id,
          token: hashedToken,
          expiresAt,
        },
      });

      // Generate reset URL
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "https://vendx.store";
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      // Send password reset email
      await sendPasswordResetEmail({
        name: user.name || "there",
        email: user.email,
        resetUrl,
        expiresIn: "15 minutes",
      });

      console.log(`✅ Password reset email sent to ${email}`);
    } else {
      console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      },
      { status: 200 },
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

    console.error("Forgot password error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
