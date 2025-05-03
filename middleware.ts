import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
//import { getSession } from "@/lib/auth"
import { getSessionFromRequest } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Auto redirect "/" ke dashboard
  if (path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Proteksi halaman dashboard
  if (path.startsWith("/dashboard")) {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

