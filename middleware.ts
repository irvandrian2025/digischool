import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Redirect root to dashboard
  if (path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow all other requests to pass through
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
