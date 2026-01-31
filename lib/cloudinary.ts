import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloudinary = async (
  file: File,
  folder: string,
): Promise<{ secure_url: string; public_id: string }> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `vendx/${folder}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        },
      )
      .end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

/**
 * Extracts the public ID from a Cloudinary URL
 * Example: https://res.cloudinary.com/demo/image/upload/v1234567890/vendx/products/my-image.jpg
 * Returns: vendx/products/my-image
 */
export const getPublicIdFromUrl = (url: string) => {
  try {
    const splitUrl = url.split("/");
    const lastSegment = splitUrl.pop();
    const folderPath = splitUrl.slice(splitUrl.indexOf("vendx")).join("/");
    // Remove extension
    const publicId = `${folderPath}/${lastSegment?.split(".")[0]}`;
    return publicId;
  } catch (error) {
    console.error("Error extracting public ID from URL:", url);
    return null;
  }
};
