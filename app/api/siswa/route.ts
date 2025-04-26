import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET all siswa
export async function GET(request: Request) {
  try {
    const result = await executeQuery(`
      SELECT s.*, k.nama as kelas_nama
      FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
      ORDER BY s.nama
    `)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching siswa:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch siswa" }, { status: 500 })
  }
}

// POST create new siswa
export async function POST(request: Request) {
  try {
    const { nis, nama, jenis_kelamin, alamat, tanggal_lahir, no_hp, email, kelas_id } = await request.json()

    if (!nis || !nama || !jenis_kelamin || !kelas_id) {
      return NextResponse.json(
        { success: false, message: "NIS, nama, jenis kelamin, dan kelas harus diisi" },
        { status: 400 },
      )
    }

    // Check if NIS already exists
    const nisCheck = await executeQuery("SELECT COUNT(*) as count FROM siswa WHERE nis = $1", [nis])
    if (Number.parseInt(nisCheck[0].count) > 0) {
      return NextResponse.json({ success: false, message: "NIS sudah digunakan" }, { status: 400 })
    }

    const result = await executeQuery(
      `
      INSERT INTO siswa (nis, nama, jenis_kelamin, alamat, tanggal_lahir, no_hp, email, kelas_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [nis, nama, jenis_kelamin, alamat, tanggal_lahir, no_hp, email, kelas_id],
    )

    return NextResponse.json({
      success: true,
      message: "Siswa created successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error creating siswa:", error)
    return NextResponse.json({ success: false, message: "Failed to create siswa" }, { status: 500 })
  }
}
