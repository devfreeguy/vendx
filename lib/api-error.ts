import { NextResponse } from "next/server";
import { z } from "zod";

type ErrorResponse = {
  success: false;
  error: {
    message: string;
    code?: string;
  };
};

export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status },
  );
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

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

  if (typeof error === "object" && error !== null && "code" in error) {
    const e = error as { code: string; meta?: any };
    // Prisma Unique Constraint Violation
    if (e.code === "P2002") {
      const target = (e.meta?.target as string[])?.join(", ") || "unique field";
      return createErrorResponse(
        `A record with this ${target} already exists.`,
        409,
        "CONFLICT",
      );
    }
    // Prisma Record Not Found
    if (e.code === "P2025") {
      return createErrorResponse("Record not found.", 404, "NOT_FOUND");
    }
  }

  return createErrorResponse(
    "An unexpected system error occurred. Please try again later.",
    500,
    "INTERNAL_SERVER_ERROR",
  );
}
