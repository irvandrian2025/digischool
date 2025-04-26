import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET all tahun ajaran
export async function GET(request: Request) {
  try {
    const result = await executeQuery("SELECT * FROM tahun_ajaran ORDER BY nama DESC")

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching tahun ajaran:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch tahun ajaran", error: String(error) },
      { status: 500 },
    )
  }
}

// POST create new tahun ajaran
export async function POST(request: Request) {
  try {
    const { nama, nominal_spp } = await request.json()

    if (!nama || !nominal_spp) {
      return NextResponse.json({ success: false, message: "Nama and nominal_spp are required" }, { status: 400 })
    }

    const result = await executeQuery("INSERT INTO tahun_ajaran (nama, nominal_spp) VALUES ($1, $2) RETURNING *", [
      nama,
      nominal_spp,
    ])

    return NextResponse.json({
      success: true,
      message: "Tahun ajaran created successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error creating tahun ajaran:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create tahun ajaran", error: String(error) },
      { status: 500 },
    )
  }
}
