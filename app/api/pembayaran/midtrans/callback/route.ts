import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import crypto from "crypto"

// Fungsi untuk memvalidasi signature key dari Midtrans
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Midtrans notification:', JSON.stringify(body, null, 2))
    
    const {
      transaction_time,
      transaction_status,
      transaction_id,
      status_message,
      status_code,
      signature_key,
      payment_type,
      order_id,
      merchant_id,
      gross_amount,
      fraud_status,
      currency,
      va_numbers
    } = body

    // Validasi server key Midtrans
    if (!process.env.MIDTRANS_SERVER_KEY_SANDBOX) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Konfigurasi Midtrans tidak lengkap"
        },
        { status: 500 }
      );
    }

    // Generate signature key untuk validasi
    const generatedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY_SANDBOX}`)
      .digest('hex').toLowerCase()

    // Validasi signature key
    if (signature_key.toLowerCase() !== generatedSignature) {
      console.log('Signature key mismatch:', {
        received: signature_key.toLowerCase(),
        generated: generatedSignature
      })
      return NextResponse.json(
        { 
          success: false, 
          message: "Signature key tidak valid",
          details: "Pastikan server key Midtrans sesuai dengan yang digunakan untuk generate signature"
        },
        { status: 401 }
      );
    }

    // Update status pembayaran di database
    await executeQuery(
      `UPDATE tagihan SET 
        midtrans_status = $1,
        midtrans_transaction_time = $2,
        midtrans_transaction_id = $3,
        midtrans_payment_type = $4,
        status = CASE WHEN $1 = 'capture' OR $1 = 'settlement' THEN 'paid' ELSE status END
      WHERE midtrans_transaction_id = $5`,
      [transaction_status, transaction_time, transaction_id, payment_type, order_id]
    )
    
    // Insert ke tabel pembayaran jika status settlement
    if (transaction_status === 'settlement') {
      await executeQuery(
        `INSERT INTO pembayaran (
          tagihan_id, 
          siswa_id, 
          jumlah, 
          metode_pembayaran, 
          status, 
          tanggal_pembayaran, 
          midtrans_transaction_id
        ) VALUES (
          (SELECT id FROM tagihan WHERE midtrans_transaction_id = $1),
          (SELECT siswa_id FROM tagihan WHERE midtrans_transaction_id = $1),
          $2,
          $3,
          'paid',
          $4,
          $5
        )`,
        [order_id, gross_amount, payment_type, transaction_time, transaction_id]
      )
    }

    // Response untuk Midtrans
    return NextResponse.json(
      { 
        status_code: "200",
        status_message: "Callback received and processed successfully"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing Midtrans notification:", error)
    return NextResponse.json(
      { status: "error" },
      { status: 500 }
    )
  }
}