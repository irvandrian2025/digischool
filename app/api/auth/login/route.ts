import { NextResponse } from "next/server"
import { authenticateUser, createToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 })
    }

    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
    }

    // Create JWT token
    const token = await createToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })

    // Set cookie
    ;(await
      // Set cookie
      cookies()).set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during login" }, { status: 500 })
  }
}
