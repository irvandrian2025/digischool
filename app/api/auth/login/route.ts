import { NextResponse } from "next/server"
import { authenticateUser, createToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password required" }, { status: 400 })
    }

    const user = await authenticateUser(username, password)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
    }

    const token = await createToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    })

    // Set cookie (HttpOnly, Secure, etc.)
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/"
    })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      redirectUrl: "/dashboard"
    })
  } catch (err) {
    console.error("Login Error:", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
