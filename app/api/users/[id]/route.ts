import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

// GET a specific user
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await executeQuery(
      "SELECT id, username, name, role, created_at, updated_at FROM users WHERE id = $1",
      [id],
    )

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT update a user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { username, password, name, role } = await request.json()

    if (!username || !name || !role) {
      return NextResponse.json({ success: false, message: "Username, name, and role are required" }, { status: 400 })
    }

    // Check if username already exists for other users
    const usernameCheck = await executeQuery("SELECT COUNT(*) as count FROM users WHERE username = $1 AND id != $2", [
      username,
      id,
    ])
    if (Number.parseInt(usernameCheck[0].count) > 0) {
      return NextResponse.json({ success: false, message: "Username already exists" }, { status: 400 })
    }

    let result
    if (password) {
      // Hash password if provided
      const hashedPassword = await hashPassword(password)
      result = await executeQuery(
        "UPDATE users SET username = $1, password = $2, name = $3, role = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, username, name, role",
        [username, hashedPassword, name, role, id],
      )
    } else {
      // Don't update password if not provided
      result = await executeQuery(
        "UPDATE users SET username = $1, name = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, username, name, role",
        [username, name, role, id],
      )
    }

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 })
  }
}

// DELETE a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Prevent deleting the last admin user
    const adminCheck = await executeQuery("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", [])
    const isAdmin = await executeQuery("SELECT role FROM users WHERE id = $1", [id])

    if (Number.parseInt(adminCheck[0].count) <= 1 && isAdmin.length > 0 && isAdmin[0].role === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak dapat menghapus user admin terakhir",
        },
        { status: 400 },
      )
    }

    const result = await executeQuery("DELETE FROM users WHERE id = $1 RETURNING id", [id])

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ success: false, message: "Failed to delete user" }, { status: 500 })
  }
}
