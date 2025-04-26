import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET a specific siswa
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await executeQuery(
      `
      SELECT s.*, k.nama as kelas_nama
      FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
      WHERE s.id = $1
    `,
      [id],
    )

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Siswa not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Error fetching siswa:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch siswa" }, { status: 500 })
  }
}

// PUT update a siswa
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { nis, nama, jenis_kelamin, alamat, tanggal_lahir, no_hp, email, kelas_id } = await request.json()

    if (!nis || !nama || !jenis_kelamin || !kelas_id) {
      return NextResponse.json(
        { success: false, message: "NIS, nama, jenis kelamin, dan kelas harus diisi" },
        { status: 400 },
      )
    }

    // Check if NIS already exists for other siswa
    const nisCheck = await executeQuery("SELECT COUNT(*) as count FROM siswa WHERE nis = $1 AND id != $2", [nis, id])
    if (Number.parseInt(nisCheck[0].count) > 0) {
      return NextResponse.json({ success: false, message: "NIS sudah digunakan" }, { status: 400 })
    }

    const result = await executeQuery(
      `
      UPDATE siswa
      SET nis = $1, nama = $2, jenis_kelamin = $3, alamat = $4, tanggal_lahir = $5, no_hp = $6, email = $7, kelas_id = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `,
      [nis, nama, jenis_kelamin, alamat, tanggal_lahir, no_hp, email, kelas_id, id],
    )

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Siswa not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Siswa updated successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error updating siswa:", error)
    return NextResponse.json({ success: false, message: "Failed to update siswa" }, { status: 500 })
  }
}

// DELETE a siswa
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if siswa has tagihan
    const tagihanCheck = await executeQuery("SELECT COUNT(*) as count FROM tagihan WHERE siswa_id = $1", [id])
    if (Number.parseInt(tagihanCheck[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Siswa tidak dapat dihapus karena masih memiliki tagihan",
        },
        { status: 400 },
      )
    }

    const result = await executeQuery("DELETE FROM siswa WHERE id = $1 RETURNING *", [id])

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Siswa not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Siswa deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting siswa:", error)
    return NextResponse.json({ success: false, message: "Failed to delete siswa" }, { status: 500 })
  }
}
