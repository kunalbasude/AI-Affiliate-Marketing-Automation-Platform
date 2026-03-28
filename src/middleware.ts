import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Firebase Client SDK stores auth state in IndexedDB/localStorage — NOT in HTTP cookies.
// Server-side cookie-based auth guards cannot work here without a separate session cookie
// setup using Firebase Admin SDK. Route protection is handled entirely client-side:
//   - DashboardLayout redirects unauthenticated users to /login
//   - AuthLayout redirects authenticated users to /dashboard
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
