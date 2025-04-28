import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import crypto from "crypto"

// Header untuk mengatasi CORS
export const dynamic = 'force-dynamic'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

// Handler untuk OPTIONS request (preflight CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

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
      console.error('Konfigurasi Midtrans tidak lengkap: MIDTRANS_SERVER_KEY_SANDBOX tidak ditemukan');
      return NextResponse.json(
        { 
          success: false, 
          message: "Konfigurasi Midtrans tidak lengkap",
          details: "Server key Midtrans tidak ditemukan di environment variables"
        },
        { 
          status: 500,
          headers: corsHeaders 
        }
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
        { 
          status: 401,
          headers: corsHeaders 
        }
      );
    }
    
    // Validasi status transaksi
    if (!['capture', 'settlement', 'pending', 'deny', 'cancel', 'expire'].includes(transaction_status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status transaksi tidak valid",
          details: `Status transaksi '${transaction_status}' tidak dikenali`
        },
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Update status pembayaran di database
    console.log('Memulai update status tagihan:', { order_id, transaction_status });
    const updateResult = await executeQuery(
      `UPDATE tagihan SET 
        midtrans_status = $[transaction_status],
        midtrans_transaction_time = $[transaction_time],
        midtrans_transaction_id = $[transaction_id],
        midtrans_payment_type = $[payment_type],
        status = CASE WHEN $[transaction_status] = 'capture' OR $[transaction_status] = 'settlement' THEN 'paid' ELSE status END
      WHERE midtrans_order_id = $[order_id]`,
      {
        transaction_status: transaction_status,
        transaction_time: transaction_time,
        transaction_id: transaction_id,
        payment_type: payment_type,
        order_id: order_id
      }
    );
    console.log('Update status tagihan selesai:', { order_id, rowsAffected: updateResult.rowCount });
    
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
          midtrans_transaction_id,
          midtrans_order_id,
          midtrans_payment_type
        ) VALUES (
          (SELECT id FROM tagihan WHERE midtrans_order_id = $[order_id]),
          (SELECT siswa_id FROM tagihan WHERE midtrans_order_id = $[order_id]),
          $[gross_amount],
          $[payment_type],
          'paid',
          $[transaction_time],
          $[transaction_id],
          $[order_id],
          $[payment_type]
        )`,
        {
          order_id: order_id,
          gross_amount: gross_amount,
          payment_type: payment_type,
          transaction_time: transaction_time,
          transaction_id: transaction_id
        }
      )
    }

    // Response untuk Midtrans
    return NextResponse.json(
      { 
        status_code: "200",
        status_message: "Callback received and processed successfully"
      },
      { 
        status: 200,
        headers: corsHeaders 
      }
    )
  } catch (error) {
    console.error("Error processing Midtrans notification:", error)
    return NextResponse.json(
      { 
        status: "error",
        message: "Gagal memproses notifikasi Midtrans",
        details: error instanceof Error ? error.message : "Terjadi kesalahan internal"
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
}
