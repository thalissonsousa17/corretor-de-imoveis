import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSession(req: NextRequest): boolean {
  const sessionId = req.cookies.get("sessionId")?.value;
  return !!sessionId;
}

export async function middleware(req: NextRequest) {
  const sessionId = getSession(req);
  const { pathname } = req.nextUrl;

  if (sessionId && (pathname.startsWith("/register") || pathname.startsWith("/login"))) {
    return NextResponse.redirect(new URL("/corretor/dashboard", req.url));
  }

  if (!sessionId && pathname.startsWith("/corretor/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/corretor/dashboard/:path*", "/register", "/login"],
};
