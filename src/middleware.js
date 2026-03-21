import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

// Avoid middleware deprecation by limiting to API routes only
export const config = {
  matcher: ["/api/:path*"],
};
