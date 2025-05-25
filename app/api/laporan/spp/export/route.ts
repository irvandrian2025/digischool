import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import ExcelJS from 'exceljs';

// GET laporan SPP per siswa per bulan tanpa paging (untuk export Excel)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tahunAjaran = searchParams.get("tahun_ajaran");
    const siswaId = searchParams.get("siswa_id");
    const kelasId = searchParams.get("kelas_id");

    if (!tahunAjaran) {
      return NextResponse.json({ success: false, message: "Parameter tahun_ajaran wajib diisi" }, { status: 400 });
    }

    let siswaQuery = `SELECT s.id, s.nama, s.kelas_id, k.tingkat, k.nama as kelas_nama
       FROM siswa s
       LEFT JOIN kelas k ON s.kelas_id = k.id`;

    const queryParams: (string | number)[] = [];
    const conditions: string[] = [];

    // Dynamically add conditions and parameters
    if (kelasId) {
      conditions.push(`s.kelas_id = $${queryParams.length + 1}::integer`);
      queryParams.push(kelasId);
    }
    if (siswaId) {
      conditions.push(`s.id = $${queryParams.length + 1}::integer`);
      queryParams.push(siswaId);
    }

    if (conditions.length > 0) {
      siswaQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    siswaQuery += ` ORDER BY s.nama`;

    const siswaList = await executeQuery(siswaQuery, queryParams);

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
    ];

    const data: any[] = [];
    for (const siswa of siswaList) {
      const row: any = {
        id: siswa.id,
        nama: siswa.nama,
        kelas: siswa.tingkat + " " + siswa.kelas_nama, // Concatenate for display
      };
      for (const bulan of bulanList) {
        // Tagihan
        const tagihanResult = await executeQuery(
          `SELECT COALESCE(SUM(nominal),0) as tagihan
           FROM tagihan
           WHERE siswa_id = $1 AND tahun_ajaran_id = $2 AND bulan = $3::text`,
          [siswa.id, tahunAjaran, bulan.label]
        );
        const tagihan = parseInt(tagihanResult[0]?.tagihan || "0", 10);

        // Pembayaran
        const pembayaranResult = await executeQuery(
          `SELECT COALESCE(SUM(jumlah_bayar),0) as pembayaran
           FROM pembayaran
           WHERE siswa_id = $1 AND tagihan_id IN (SELECT id FROM tagihan WHERE tahun_ajaran_id = $2 AND bulan = $3)`,
          [siswa.id, tahunAjaran, bulan.label]
        );
        const pembayaran = parseInt(pembayaranResult[0]?.pembayaran || "0", 10);

        // Status
        const status = pembayaran >= tagihan && tagihan > 0 ? "Lunas" : (tagihan > 0 ? "Belum" : "-");
        row[bulan.key] = {
          tagihan,
          pembayaran,
          status,
        };
      }
      data.push(row);
    }

    // --- Excel Generation Logic ---
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan SPP');

    // Define columns for the Excel sheet to set widths and default styles
    const columnDefinitions = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Siswa', key: 'nama', width: 30 },
      { header: 'Kelas', key: 'kelas', width: 20 },
    ];

    bulanList.forEach(bulan => {
      columnDefinitions.push(
        { header: 'Tagihan', key: `${bulan.key}_tagihan`, width: 15, style: { numFmt: '#,##0' } }, // Currency format
        { header: 'Pembayaran', key: `${bulan.key}_pembayaran`, width: 15, style: { numFmt: '#,##0' } }, // Currency format
        { header: 'Status', key: `${bulan.key}_status`, width: 15 }
      );
    });
    worksheet.columns = columnDefinitions;

    // Add header rows with merged cells
    const headerRow1 = worksheet.getRow(1);
    const headerRow2 = worksheet.getRow(2);

    // Initial columns for headerRow1
    headerRow1.getCell(1).value = 'No';
    headerRow1.getCell(2).value = 'Nama Siswa';
    headerRow1.getCell(3).value = 'Kelas';

    // Merge cells for initial columns across two rows
    worksheet.mergeCells('A1:A2');
    worksheet.mergeCells('B1:B2');
    worksheet.mergeCells('C1:C2');

    // Populate month headers and sub-headers
    let currentColumn = 4; // Start from column D (1-indexed)
    bulanList.forEach(bulan => {
      // Month header in Row 1 (merged)
      headerRow1.getCell(currentColumn).value = bulan.label;
      worksheet.mergeCells(1, currentColumn, 1, currentColumn + 2);

      // Sub-headers in Row 2
      headerRow2.getCell(currentColumn).value = 'Tagihan';
      headerRow2.getCell(currentColumn + 1).value = 'Pembayaran';
      headerRow2.getCell(currentColumn + 2).value = 'Status';

      currentColumn += 3; // Move to the next set of 3 columns for the next month
    });

    // Apply styles to header rows (bold, center, borders)
    [headerRow1, headerRow2].forEach(row => {
      row.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Add data to the worksheet, starting from row 3
    data.forEach((row, index) => {
      const dataRow = worksheet.addRow([]); // Add an empty row
      dataRow.getCell(1).value = index + 1; // No
      dataRow.getCell(2).value = row.nama; // Nama Siswa
      dataRow.getCell(3).value = row.kelas; // Kelas

      let currentDataColumn = 4;
      bulanList.forEach(bulan => {
        dataRow.getCell(currentDataColumn).value = row[bulan.key].tagihan;
        dataRow.getCell(currentDataColumn + 1).value = row[bulan.key].pembayaran;
        dataRow.getCell(currentDataColumn + 2).value = row[bulan.key].status;

        currentDataColumn += 3;
      });

      // Apply formatting to data cells (borders and status alignment)
      dataRow.eachCell((cell, colNumber) => {
        // Apply currency format to Tagihan and Pembayaran columns
        if (((colNumber - 4) % 3 === 0) || ((colNumber - 4) % 3 === 1)) { // Tagihan and Pembayaran columns
          cell.numFmt = '#,##0'; // Currency format without symbol
        }
        // Center align status column
        if ((colNumber - 4) % 3 === 2) { // Status column
          cell.alignment = { horizontal: 'center' };
        }
        // Add borders
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Generate timestamp for filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[^0-9]/g, '').slice(0, 14);

    // Generate the Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return the Excel file as a response
    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="laporan_spp_${tahunAjaran}_${timestamp}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });

  } catch (error) {
    console.error("Error laporan spp export:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data laporan spp export", error: String(error) }, { status: 500 });
  }
}