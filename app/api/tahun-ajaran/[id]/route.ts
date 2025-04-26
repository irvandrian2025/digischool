import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET a specific tahun ajaran
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await executeQuery("SELECT * FROM tahun_ajaran WHERE id = $1", [id])

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Tahun ajaran not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Error fetching tahun ajaran:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch tahun ajaran", error: String(error) },
      { status: 500 },
    )
  }
}

// PUT update a tahun ajaran
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { nama, nominal_spp } = await request.json()

    if (!nama || !nominal_spp) {
      return NextResponse.json({ success: false, message: "Nama and nominal_spp are required" }, { status: 400 })
    }

    const result = await executeQuery(
      "UPDATE tahun_ajaran SET nama = $1, nominal_spp = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [nama, nominal_spp, id],
    )

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Tahun ajaran not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Tahun ajaran updated successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error updating tahun ajaran:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update tahun ajaran", error: String(error) },
      { status: 500 },
    )
  }
}

// DELETE a tahun ajaran
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if tahun ajaran is used in tagihan
    const tagihanCheck = await executeQuery("SELECT COUNT(*) as count FROM tagihan WHERE tahun_ajaran_id = $1", [id])

    if (Number.parseInt(tagihanCheck[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun ajaran tidak dapat dihapus karena masih digunakan dalam tagihan",
        },
        { status: 400 },
      )
    }

    const result = await executeQuery("DELETE FROM tahun_ajaran WHERE id = $1 RETURNING *", [id])

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Tahun ajaran not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Tahun ajaran deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting tahun ajaran:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete tahun ajaran", error: String(error) },
      { status: 500 },
    )
  }
}
