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
    console.log('Midtrans notification (alt):', JSON.stringify(body, null, 2))
    
    const {
      transaction_time,
      transaction_status,
      transaction_id,
      status_message,
      status_code,
      signature_key,
      settlement_time,
      payment_type,
      order_id,
      merchant_id,
      gross_amount,
      fraud_status,
      expiry_time,
      currency,
      approval_code,
      va_numbers
    } = body

    // Validasi server key Midtrans
    if (!process.env.MIDTRANS_SERVER_KEY_SANDBOX) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Konfigurasi Midtrans tidak lengkap"
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
      console.log('Signature key mismatch (alt):', {
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
    await executeQuery(
      `UPDATE tagihan SET 
        midtrans_status = $[transaction_status],
        midtrans_transaction_time = $[transaction_time],
        midtrans_transaction_id = $[transaction_id],
        midtrans_payment_type = $[payment_type],
        midtrans_settlement_time = $[settlement_time],
        midtrans_expiry_time = $[expiry_time],
        midtrans_approval_code = $[approval_code],
        status = CASE WHEN $[transaction_status] = 'capture' OR $[transaction_status] = 'settlement' THEN 'paid' ELSE status END
      WHERE midtrans_order_id = $[order_id]`,
      {
        transaction_status: transaction_status,
        transaction_time: transaction_time,
        transaction_id: transaction_id,
        payment_type: payment_type,
        settlement_time: settlement_time,
        expiry_time: expiry_time,
        approval_code: approval_code,
        order_id: order_id
      }
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
        status_message: "Callback received and processed successfully (alt)"
      },
      { 
        status: 200,
        headers: corsHeaders 
      }
    )
  } catch (error) {
    console.error("Error processing Midtrans notification (alt):", error)
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