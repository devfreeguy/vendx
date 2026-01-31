import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { addressSchema } from "@/lib/schemas";
import { createErrorResponse } from "@/lib/api-error";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session.userId as string },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error("GET /api/user/addresses error", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const body = await req.json();
    const data = addressSchema.parse(body);

    // Check if first address
    const count = await prisma.address.count({
      where: { userId: session.userId as string },
    });

    const isDefault = count === 0;

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: session.userId as string,
        isDefault,
      },
    });

    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        "Validation Failed",
        400,
        "VALIDATION_ERROR",
      );
    }
    console.error("POST /api/user/addresses error", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
