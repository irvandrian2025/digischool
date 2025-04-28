import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import crypto from "crypto"

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

    const generatedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY_SANDBOX}`)
      .digest('hex')
      .toLowerCase()

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

    // Proses untuk status sukses capture/settlement
    if (['capture', 'settlement'].includes(transaction_status)) {
      console.log('Memulai insert data pembayaran:', { order_id, gross_amount });

      await executeQuery(
        `INSERT INTO pembayaran (
          tagihan_id, 
          siswa_id, 
          jumlah_bayar, 
          metode_pembayaran, 
          status, 
          tanggal_bayar, 
          midtrans_transaction_id,
          midtrans_order_id,
          midtrans_payment_type
        ) VALUES (
          (SELECT id FROM tagihan WHERE midtrans_transaction_id = $1),
          (SELECT siswa_id FROM tagihan WHERE midtrans_transaction_id = $1),
          $2,
          $3,
          'paid',
          $4,
          $5,
          $6,
          $7
        ) RETURNING id`,
        [
          order_id,
          gross_amount,
          payment_type,
          transaction_time,
          transaction_id,
          order_id,
          payment_type
        ]
      );

      console.log('Memulai update status tagihan:', { order_id, transaction_status });

      const updateResult = await executeQuery(
        `UPDATE tagihan SET 
          midtrans_status = $1::varchar(50),
          midtrans_transaction_time = $2,
          midtrans_transaction_id = $3,
          midtrans_payment_type = $4,
          status = CASE WHEN $1 = 'capture' OR $1 = 'settlement' THEN 'paid' ELSE status END
        WHERE midtrans_transaction_id = $5`,
        [
          transaction_status,
          transaction_time,
          transaction_id,
          payment_type,
          order_id
        ]
      );

      if (updateResult.rowCount === 0) {
        throw new Error(`Tagihan dengan order_id ${order_id} tidak ditemukan`);
      }

      console.log('Update status tagihan selesai:', { order_id, rowsAffected: updateResult.rowCount });
    }

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
