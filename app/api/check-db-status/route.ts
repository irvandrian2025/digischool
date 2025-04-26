import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    // Check if there are any users in the database
    const usersResult = await executeQuery("SELECT COUNT(*) as count FROM users")
    const userCount = Number.parseInt(usersResult[0].count)

    // Check if there are any tahun_ajaran records
    const tahunAjaranResult = await executeQuery("SELECT COUNT(*) as count FROM tahun_ajaran")
    const tahunAjaranCount = Number.parseInt(tahunAjaranResult[0].count)

    // Database is considered seeded if there's at least one user and one tahun_ajaran
    const isSeeded = userCount > 0 && tahunAjaranCount > 0

    return NextResponse.json({
      success: true,
      isSeeded,
      counts: {
        users: userCount,
        tahunAjaran: tahunAjaranCount,
      },
    })
  } catch (error) {
    console.error("Error checking database status:", error)
    return NextResponse.json(
      { success: false, message: "Failed to check database status", error: String(error) },
      { status: 500 },
    )
  }
}
