import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET all kelas
export async function GET(request: Request) {
  try {
    console.log("Fetching all kelas")
    const result = await executeQuery(`
      SELECT k.*, COUNT(s.id) as jumlah_siswa
      FROM kelas k
      LEFT JOIN siswa s ON k.id = s.kelas_id
      GROUP BY k.id
      ORDER BY k.tingkat, k.nama
    `)
    console.log("Kelas result:", result)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching kelas:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch kelas", error: String(error) },
      { status: 500 },
    )
  }
}

// POST create new kelas
export async function POST(request: Request) {
  try {
    const { nama, tingkat, wali_kelas } = await request.json()
    console.log("Creating kelas:", { nama, tingkat, wali_kelas })

    if (!nama || !tingkat) {
      return NextResponse.json({ success: false, message: "Nama and tingkat are required" }, { status: 400 })
    }

    const result = await executeQuery("INSERT INTO kelas (nama, tingkat, wali_kelas) VALUES ($1, $2, $3) RETURNING *", [
      nama,
      tingkat,
      wali_kelas,
    ])
    console.log("Create kelas result:", result)

    return NextResponse.json({
      success: true,
      message: "Kelas created successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error creating kelas:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create kelas", error: String(error) },
      { status: 500 },
    )
  }
}
