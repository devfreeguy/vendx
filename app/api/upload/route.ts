import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;

    if (!file) {
      return createErrorResponse("No file provided", 400, "VALIDATION_ERROR");
    }

    // Validate allowed folders to prevent arbitrary uploads
    const allowedFolders = ["products", "users/profile"];
    if (!allowedFolders.includes(folder)) {
      return createErrorResponse("Invalid folder", 400, "VALIDATION_ERROR");
    }

    const result = await uploadToCloudinary(file, folder);

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return createErrorResponse(
      error.message || "Upload failed",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
