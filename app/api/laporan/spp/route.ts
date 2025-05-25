import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET laporan SPP per siswa per bulan
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tahunAjaranId = searchParams.get("tahun_ajaran") // Renamed to tahunAjaranId for clarity
    const kelasId = searchParams.get("kelas_id")
    const siswaId = searchParams.get("siswa_id")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "10", 10)

    if (!tahunAjaranId) {
      return NextResponse.json({ success: false, message: "Parameter tahun_ajaran wajib diisi" }, { status: 400 })
    }

    // Fetch tahun_ajaran details
    const tahunAjaranDetails = await executeQuery(
      `SELECT nama, nominal_spp FROM tahun_ajaran WHERE id = $1::integer`,
      [tahunAjaranId]
    );

    if (tahunAjaranDetails.length === 0) {
      return NextResponse.json({ success: false, message: "Tahun ajaran tidak ditemukan" }, { status: 404 })
    }

    const { nama: namaTahunAjaran, nominal_spp: nominalSpp } = tahunAjaranDetails[0];

    // Paging offset
    const offset = (page - 1) * perPage

    let siswaQuery = `SELECT s.id, s.nis, s.nama, s.no_hp, s.kelas_id, k.tingkat, k.nama as kelas_nama
       FROM siswa s
       LEFT JOIN kelas k ON s.kelas_id = k.id`
    let totalQuery = "SELECT COUNT(*) as total FROM siswa s"

    const queryParams: (string | number)[] = []
    const conditions: string[] = []

    // Add conditions based on optional parameters
    if (kelasId) {
      conditions.push(`s.kelas_id = $${queryParams.length + 1}::integer`)
      queryParams.push(kelasId.toString())
    }
    if (siswaId) {
      conditions.push(`s.id = $${queryParams.length + 1}::integer`)
      queryParams.push(siswaId.toString())
    }

    // Append WHERE clause if conditions exist
    if (conditions.length > 0) {
      siswaQuery += ` WHERE ${conditions.join(" AND ")}`
      totalQuery += ` WHERE ${conditions.join(" AND ")}`
    }

    // Add LIMIT and OFFSET for pagination to siswaQuery
    siswaQuery += ` ORDER BY s.nama LIMIT $${queryParams.length + 1}::integer OFFSET $${queryParams.length + 2}::integer`
    queryParams.push(perPage, offset)

    const siswaList = await executeQuery(siswaQuery, queryParams)

    // Execute totalQuery with only the filter parameters (excluding limit and offset)
    const totalSiswaResult = await executeQuery(totalQuery, queryParams.slice(0, queryParams.length - 2))
    const totalSiswa = parseInt(totalSiswaResult[0]?.total || "0", 10)

    // Bulan SPP
    const bulanList = [
      { key: "juli", label: "Juli", num: 7 },
      { key: "agustus", label: "Agustus", num: 8 },
      { key: "september", label: "September", num: 9 },
      { key: "oktober", label: "Oktober", num: 10 },
      { key: "november", label: "November", num: 11 },
      { key: "desember", label: "Desember", num: 12 },
      { key: "januari", label: "Januari", num: 1 },
      { key: "februari", label: "Februari", num: 2 },
      { key: "maret", label: "Maret", num: 3 },
      { key: "april", label: "April", num: 4 },
      { key: "mei", label: "Mei", num: 5 },
      { key: "juni", label: "Juni", num: 6 },
    ]

    // Untuk setiap siswa, ambil data tagihan dan pembayaran per bulan
    const data = []
    for (const siswa of siswaList) {
      let formattedNoHp = siswa.no_hp;
      if (formattedNoHp && formattedNoHp.startsWith('08')) {
        formattedNoHp = '628' + formattedNoHp.substring(2);
      }

      const row: any = {
        id: siswa.id,
        nis: siswa.nis, // Add nis
        nama: siswa.nama,
        no_hp: formattedNoHp, // Add formatted no_hp
        kelas: siswa.kelas_nama,
        tahun_ajaran_nama: namaTahunAjaran, // Add tahun_ajaran_nama
        nominal_spp_tahun_ajaran: parseFloat(nominalSpp), // Add nominal_spp from tahun_ajaran
      }
      for (const bulan of bulanList) {
        // Tagihan
        const tagihanResult = await executeQuery(
          `SELECT COALESCE(SUM(nominal),0) as tagihan
           FROM tagihan
           WHERE siswa_id = $1 AND tahun_ajaran_id = $2 AND bulan = $3::text`,
          [siswa.id, tahunAjaranId, bulan.label]
        );
        const tagihan = parseInt(tagihanResult[0]?.tagihan || "0", 10)

        // Pembayaran
        const pembayaranResult = await executeQuery(
          `SELECT COALESCE(SUM(jumlah_bayar),0) as pembayaran
           FROM pembayaran
           WHERE siswa_id = $1 AND tagihan_id IN (SELECT id FROM tagihan WHERE tahun_ajaran_id = $2 AND bulan = $3)`,
          [siswa.id, tahunAjaranId, bulan.label]
        );
        const pembayaran = parseInt(pembayaranResult[0]?.pembayaran || "0", 10)

        // Status
        const status = pembayaran >= tagihan && tagihan > 0 ? "Lunas" : (tagihan > 0 ? "Belum" : "-")
        row[bulan.key] = {
          tagihan,
          pembayaran,
          status,
        }
      }
      data.push(row)
    }

    return NextResponse.json({
      success: true,
      data,
      paging: {
        page,
        perPage,
        total: totalSiswa,
        totalPage: Math.ceil(totalSiswa / perPage),
      },
    })
  } catch (error) {
    console.error("Error laporan spp:", error)
    return NextResponse.json({ success: false, message: "Gagal mengambil data laporan spp", error: String(error) }, { status: 500 })
  }
}