import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET a specific pembayaran
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await executeQuery(
      `
      SELECT p.*, t.bulan, t.tahun, t.nominal as tagihan_nominal, t.status as tagihan_status,
      s.nama as siswa_nama, s.nis as siswa_nis, k.nama as kelas_nama, ta.nama as tahun_ajaran_nama
      FROM pembayaran p
      JOIN tagihan t ON p.tagihan_id = t.id
      JOIN siswa s ON t.siswa_id = s.id
      JOIN kelas k ON s.kelas_id = k.id
      JOIN tahun_ajaran ta ON t.tahun_ajaran_id = ta.id
      WHERE p.id = $1
      `,
      [id],
    )

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Pembayaran not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Error fetching pembayaran:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch pembayaran" }, { status: 500 })
  }
}

// PUT update a pembayaran
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { tagihan_id, tanggal_bayar, metode_pembayaran, jumlah_bayar, bukti_pembayaran, keterangan } =
      await request.json()

    if (!tagihan_id || !tanggal_bayar || !metode_pembayaran || !jumlah_bayar) {
      return NextResponse.json(
        { success: false, message: "Tagihan, tanggal bayar, metode pembayaran, dan jumlah bayar harus diisi" },
        { status: 400 },
      )
    }

    // Check if pembayaran exists
    const pembayaranCheck = await executeQuery("SELECT * FROM pembayaran WHERE id = $1", [id])
    if (pembayaranCheck.length === 0) {
      return NextResponse.json({ success: false, message: "Pembayaran tidak ditemukan" }, { status: 404 })
    }

    // Check if trying to change tagihan_id
    const currentTagihanId = pembayaranCheck[0].tagihan_id
    if (currentTagihanId !== tagihan_id) {
      // Check if new tagihan already has a payment
      const paymentCheck = await executeQuery("SELECT COUNT(*) as count FROM pembayaran WHERE tagihan_id = $1", [
        tagihan_id,
      ])
      if (Number.parseInt(paymentCheck[0].count) > 0) {
        return NextResponse.json({ success: false, message: "Tagihan baru sudah memiliki pembayaran" }, { status: 400 })
      }

      // Reset old tagihan status to pending
      await executeQuery("UPDATE tagihan SET status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [
        currentTagihanId,
      ])
    }

    // Update pembayaran
    const result = await executeQuery(
      `
      UPDATE pembayaran
      SET tagihan_id = $1, tanggal_bayar = $2, metode_pembayaran = $3, jumlah_bayar = $4, 
          bukti_pembayaran = $5, keterangan = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
      `,
      [tagihan_id, tanggal_bayar, metode_pembayaran, jumlah_bayar, bukti_pembayaran, keterangan, id],
    )

    // Update new tagihan status to paid
    await executeQuery("UPDATE tagihan SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [tagihan_id])

    return NextResponse.json({
      success: true,
      message: "Pembayaran updated successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error updating pembayaran:", error)
    return NextResponse.json({ success: false, message: "Failed to update pembayaran" }, { status: 500 })
  }
}

// DELETE a pembayaran
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get tagihan_id before deleting
    const pembayaran = await executeQuery("SELECT tagihan_id FROM pembayaran WHERE id = $1", [id])
    if (pembayaran.length === 0) {
      return NextResponse.json({ success: false, message: "Pembayaran not found" }, { status: 404 })
    }

    const tagihanId = pembayaran[0].tagihan_id

    // Delete pembayaran
    const result = await executeQuery("DELETE FROM pembayaran WHERE id = $1 RETURNING *", [id])

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Pembayaran not found" }, { status: 404 })
    }

    // Update tagihan status back to pending
    await executeQuery("UPDATE tagihan SET status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [
      tagihanId,
    ])

    return NextResponse.json({
      success: true,
      message: "Pembayaran deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting pembayaran:", error)
    return NextResponse.json({ success: false, message: "Failed to delete pembayaran" }, { status: 500 })
  }
}
