import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout Error:", error);
    return createErrorResponse(
      "Failed to logout",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
