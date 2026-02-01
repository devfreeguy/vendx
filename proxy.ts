import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY =
  process.env.JWT_SECRET || "super-secret-key-change-this-in-env";
const key = new TextEncoder().encode(SECRET_KEY);

// Simple in-memory rate limiter (per instance)
// Note: This is ephemeral/instance-local. For distributed rate limiting, use Redis.
const rateLimitMap = new Map<string, { count: number; startTime: number }>();

function rateLimit(ip: string) {
  const windowMs = 60 * 1000; // 1 minute
  const limit = 60; // 60 requests per minute

  // Basic cleanup
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear();
  }

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }

  if (now - record.startTime > windowMs) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }

  if (record.count >= limit) {
    return true; // Rate limited
  }

  record.count += 1;
  return false;
}

export default async function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

  if (rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const method = request.method;
  const pathname = request.nextUrl.pathname;

  // Public paths that involve mutation (Login/Register)
  const isPublicAuthPath =
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register");

  // Mutating methods (POST, PUT, PATCH, DELETE) require auth, unless it's a public auth path
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
    !isPublicAuthPath
  ) {
    const session = request.cookies.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await jwtVerify(session, key, { algorithms: ["HS256"] });
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
