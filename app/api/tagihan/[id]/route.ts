import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET a specific tagihan
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await executeQuery(
      `
      SELECT t.*, s.nama as siswa_nama, s.nis as siswa_nis, k.nama as kelas_nama, ta.nama as tahun_ajaran_nama
      FROM tagihan t
      JOIN siswa s ON t.siswa_id = s.id
      JOIN kelas k ON s.kelas_id = k.id
      JOIN tahun_ajaran ta ON t.tahun_ajaran_id = ta.id
      WHERE t.id = $1
      `,
      [id],
    )

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Tagihan not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Error fetching tagihan:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch tagihan" }, { status: 500 })
  }
}

// PUT update a tagihan
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { siswa_id, tahun_ajaran_id, bulan, tahun, nominal, status, tanggal_jatuh_tempo, keterangan } =
      await request.json()

    if (!siswa_id || !tahun_ajaran_id || !bulan || !tahun || !nominal || !status || !tanggal_jatuh_tempo) {
      return NextResponse.json(
        { success: false, message: "Semua field harus diisi kecuali keterangan" },
        { status: 400 },
      )
    }

    const result = await executeQuery(
      `
      UPDATE tagihan
      SET siswa_id = $1, tahun_ajaran_id = $2, bulan = $3, tahun = $4, nominal = $5, 
          status = $6, tanggal_jatuh_tempo = $7, keterangan = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
      `,
      [siswa_id, tahun_ajaran_id, bulan, tahun, nominal, status, tanggal_jatuh_tempo, keterangan, id],
    )

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Tagihan not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Tagihan updated successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error updating tagihan:", error)
    return NextResponse.json({ success: false, message: "Failed to update tagihan" }, { status: 500 })
  }
}

// DELETE a tagihan
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if tagihan has pembayaran
    const pembayaranCheck = await executeQuery("SELECT COUNT(*) as count FROM pembayaran WHERE tagihan_id = $1", [id])
    if (Number.parseInt(pembayaranCheck[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tagihan tidak dapat dihapus karena sudah memiliki pembayaran",
        },
        { status: 400 },
      )
    }

    const result = await executeQuery("DELETE FROM tagihan WHERE id = $1 RETURNING *", [id])

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Tagihan not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Tagihan deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting tagihan:", error)
    return NextResponse.json({ success: false, message: "Failed to delete tagihan" }, { status: 500 })
  }
}
