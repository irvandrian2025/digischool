import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

// GET all users
export async function GET(request: Request) {
  try {
    const result = await executeQuery(
      "SELECT id, username, name, role, created_at, updated_at FROM users ORDER BY name",
    )

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 })
  }
}

// POST create new user
export async function POST(request: Request) {
  try {
    const { username, password, name, role } = await request.json()

    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { success: false, message: "Username, password, name, and role are required" },
        { status: 400 },
      )
    }

    // Check if username already exists
    const usernameCheck = await executeQuery("SELECT COUNT(*) as count FROM users WHERE username = $1", [username])
    if (Number.parseInt(usernameCheck[0].count) > 0) {
      return NextResponse.json({ success: false, message: "Username already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    const result = await executeQuery(
      "INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role",
      [username, hashedPassword, name, role],
    )

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 })
  }
}
