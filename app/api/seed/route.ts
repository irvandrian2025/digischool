import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    // First, check if data already exists to avoid duplicates
    const userCheck = await executeQuery("SELECT COUNT(*) as count FROM users")
    const userCount = Number.parseInt(userCheck[0].count)

    const tahunAjaranCheck = await executeQuery("SELECT COUNT(*) as count FROM tahun_ajaran")
    const tahunAjaranCount = Number.parseInt(tahunAjaranCheck[0].count)

    const kelasCheck = await executeQuery("SELECT COUNT(*) as count FROM kelas")
    const kelasCount = Number.parseInt(kelasCheck[0].count)

    const siswaCheck = await executeQuery("SELECT COUNT(*) as count FROM siswa")
    const siswaCount = Number.parseInt(siswaCheck[0].count)

    // Only insert data if it doesn't exist
    if (tahunAjaranCount === 0) {
      // Insert dummy academic years
      await executeQuery(`
        INSERT INTO tahun_ajaran (nama, nominal_spp)
        VALUES 
          ('2022/2023', 500000),
          ('2023/2024', 550000),
          ('2024/2025', 600000);
      `)
    }

    if (kelasCount === 0) {
      // Insert dummy classes
      await executeQuery(`
        INSERT INTO kelas (nama, tingkat, wali_kelas)
        VALUES 
          ('10-A', '10', 'Budi Santoso'),
          ('10-B', '10', 'Siti Aminah'),
          ('11-A', '11', 'Joko Widodo'),
          ('11-B', '11', 'Mega Wati'),
          ('12-A', '12', 'Susilo Bambang'),
          ('12-B', '12', 'Prabowo Subianto');
      `)
    }

    if (siswaCount === 0) {
      // Get kelas IDs
      const kelasData = await executeQuery("SELECT id FROM kelas ORDER BY id")

      if (kelasData.length > 0) {
        // Insert dummy students one by one to avoid conflicts
        for (let i = 1; i <= 30; i++) {
          const nis = "10" + i.toString().padStart(4, "0")
          const nama = "Siswa " + i
          const jenisKelamin = i % 2 === 0 ? "L" : "P"
          const alamat = "Jl. Pendidikan No. " + i
          const tanggalLahir = new Date(2005, 0, i).toISOString().split("T")[0]
          const noHp = "08" + (i + 1000000).toString().padStart(8, "0")
          const email = "siswa" + i + "@example.com"
          const kelasId = kelasData[i % kelasData.length].id

          await executeQuery(
            `
            INSERT INTO siswa (nis, nama, jenis_kelamin, alamat, tanggal_lahir, no_hp, email, kelas_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
            [nis, nama, jenisKelamin, alamat, tanggalLahir, noHp, email, kelasId],
          )
        }
      }
    }

    if (userCount === 0) {
      // Insert admin user (password: admin123)
      await executeQuery(`
        INSERT INTO users (username, password, name, role)
        VALUES ('admin', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'Administrator', 'admin');
      `)
    }

    return NextResponse.json({
      success: true,
      message: "Dummy data inserted successfully",
      counts: {
        tahunAjaran: tahunAjaranCount > 0 ? tahunAjaranCount : 3,
        kelas: kelasCount > 0 ? kelasCount : 6,
        siswa: siswaCount > 0 ? siswaCount : 30,
        users: userCount > 0 ? userCount : 1,
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { success: false, message: "Failed to seed database", error: String(error) },
      { status: 500 },
    )
  }
}
