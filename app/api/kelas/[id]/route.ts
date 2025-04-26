import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET a specific kelas
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Fetching kelas with id: ${id}`)
    const result = await executeQuery(
      `
      SELECT k.*, COUNT(s.id) as jumlah_siswa
      FROM kelas k
      LEFT JOIN siswa s ON k.id = s.kelas_id
      WHERE k.id = $1
      GROUP BY k.id
    `,
      [id],
    )
    console.log("Kelas result:", result)

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Kelas not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Error fetching kelas:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch kelas", error: String(error) },
      { status: 500 },
    )
  }
}

// PUT update a kelas
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { nama, tingkat, wali_kelas } = await request.json()
    console.log(`Updating kelas with id: ${id}`, { nama, tingkat, wali_kelas })

    if (!nama || !tingkat) {
      return NextResponse.json({ success: false, message: "Nama and tingkat are required" }, { status: 400 })
    }

    const result = await executeQuery(
      "UPDATE kelas SET nama = $1, tingkat = $2, wali_kelas = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [nama, tingkat, wali_kelas, id],
    )
    console.log("Update kelas result:", result)

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Kelas not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Kelas updated successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error updating kelas:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update kelas", error: String(error) },
      { status: 500 },
    )
  }
}

// DELETE a kelas
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Deleting kelas with id: ${id}`)

    // Check if kelas is used in siswa
    const siswaCheck = await executeQuery("SELECT COUNT(*) as count FROM siswa WHERE kelas_id = $1", [id])
    console.log("Siswa check result:", siswaCheck)

    if (Number.parseInt(siswaCheck[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kelas tidak dapat dihapus karena masih digunakan oleh siswa",
        },
        { status: 400 },
      )
    }

    const result = await executeQuery("DELETE FROM kelas WHERE id = $1 RETURNING *", [id])
    console.log("Delete kelas result:", result)

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Kelas not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Kelas deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting kelas:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete kelas", error: String(error) },
      { status: 500 },
    )
  }
}
