import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Allow localhost images if needed
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // Include WASM files for serverless deployment on Vercel
  // This ensures tiny-secp256k1's WASM file is bundled with API routes
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/tiny-secp256k1/**/*.wasm"],
  },
};

export default nextConfig;
