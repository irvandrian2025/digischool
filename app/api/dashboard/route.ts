import { NextResponse } from "next/server";
import { db, executeQuery } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get filter params
    const tahunAjaranId = searchParams.get('tahun_ajaran_id') || '';
    const kelasId = searchParams.get('kelas_id') || '';
    const bulan = searchParams.get('bulan') || '';
    const tahun = searchParams.get('tahun') || '';
    const status = searchParams.get('status') || 'pending';

    // Build where conditions
    const where: any = {};
    
    if (tahunAjaranId) where.tahun_ajaran_id = parseInt(tahunAjaranId);
    if (kelasId) where.kelas_id = parseInt(kelasId);
    if (bulan) where.bulan = bulan;
    if (tahun) where.tahun = parseInt(tahun);
    if (status) where.status = status;

    // Build SQL conditions
    let whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (tahunAjaranId) {
      const tahunAjaranIds = tahunAjaranId.split(',').map(id => parseInt(id.trim()));
      whereConditions.push(`t.tahun_ajaran_id = ANY($${paramIndex})`);
      params.push(tahunAjaranIds);
      paramIndex++;
    }
    if (kelasId) {
      const kelasIds = kelasId.split(',').map(id => parseInt(id.trim()));
      whereConditions.push(`s.kelas_id = ANY($${paramIndex})`);
      params.push(kelasIds);
      paramIndex++;
    }
    if (bulan) {
      const bulanList = bulan.split(',').map(b => b.trim());
      whereConditions.push(`t.bulan = ANY($${paramIndex})`);
      params.push(bulanList);
      paramIndex++;
    }
    if (tahun) {
      const tahunList = tahun.split(',').map(t => parseInt(t.trim()));
      whereConditions.push(`t.tahun = ANY($${paramIndex})`);
      params.push(tahunList);
      paramIndex++;
    }
    if (status) {
      const statusList = status.split(',').map(s => s.trim());
      whereConditions.push(`t.status = ANY($${paramIndex})`);
      params.push(statusList);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get counts and latest data
    const [totalStudents, totalBills, totalPaidBills, totalPayments, latestBills, latestPayments] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM siswa', []).then(res => res[0].count),
      executeQuery(`SELECT COUNT(*) as count FROM tagihan t JOIN siswa s ON t.siswa_id = s.id ${whereClause}`, params).then(res => res[0].count),
      executeQuery(`SELECT COUNT(*) as count FROM tagihan t JOIN siswa s ON t.siswa_id = s.id ${whereClause} AND t.status = 'paid'`, params).then(res => res[0].count),
      executeQuery('SELECT COALESCE(SUM(jumlah_bayar), 0) as sum FROM pembayaran', []).then(res => res[0].sum),
      executeQuery(
        `SELECT t.id, t.siswa_id, t.tahun_ajaran_id, t.bulan, t.tahun, COALESCE(ta.nominal_spp::integer, 0) as jumlah_tagihan, t.status, t.created_at, s.nama as siswa_nama, s.nis as siswa_nis, k.nama as kelas_nama, ta.nama as tahun_ajaran_nama 
        FROM tagihan t 
        JOIN siswa s ON t.siswa_id = s.id 
        JOIN kelas k ON s.kelas_id = k.id 
        JOIN tahun_ajaran ta ON t.tahun_ajaran_id = ta.id 
        ${whereClause} 
        ORDER BY t.created_at DESC 
        LIMIT 5`, 
        params
      ),
      executeQuery(
        `SELECT p.id, p.tagihan_id, p.jumlah_bayar, p.tanggal_bayar, p.keterangan, s.nama as siswa_nama, t.bulan, t.tahun 
        FROM pembayaran p 
        JOIN tagihan t ON p.tagihan_id = t.id 
        JOIN siswa s ON t.siswa_id = s.id 
        ORDER BY p.tanggal_bayar DESC 
        LIMIT 5`, 
        []
      )
    ]);

    return NextResponse.json({
      data: {
        totalStudents,
        totalBills,
        totalPaidBills,
        totalPayments: totalPayments || 0,
        latestBills,
        latestPayments
      },
      message: "Data dashboard berhasil diambil"
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { 
        message: "Gagal mengambil data dashboard",
        error: String(error)
      },
      { status: 500 }
    );
  }
}