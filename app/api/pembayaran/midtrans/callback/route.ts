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

// Fungsi untuk memvalidasi signature key dari Midtrans
// Handler untuk OPTIONS request (preflight CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Midtrans notification:', JSON.stringify(body, null, 2))
    
    // Validasi format body request
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      console.error('Invalid request body format:', body)
      return NextResponse.json(
        { 
          status: "error",
          message: "Format request tidak valid"
        },
        { 
          status: 400,
          headers: corsHeaders 
        }
      )
    }
    
    console.log('Request masuk:', {
      order_id: body.order_id,
      gross_amount: body.gross_amount,
      payment_type: body.payment_type,
      transaction_status: body.transaction_status
    })
    
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
      va_numbers = []
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
      console.log('Signature key mismatch:', {
        received: signature_key.toLowerCase(),
        generated: generatedSignature
      })
      console.log('Detail validasi signature:', {
        order_id,
        status_code,
        gross_amount,
        server_key: process.env.MIDTRANS_SERVER_KEY_SANDBOX ? '***' : 'tidak ada'
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

    // Insert ke tabel pembayaran terlebih dahulu sebelum update status
    try {
      console.log('Memulai insert data pembayaran:', { order_id, gross_amount })
      const insertResult = await executeQuery(
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
        ) RETURNING id`,
        {
          order_id: order_id,
          gross_amount: gross_amount,
          payment_type: payment_type,
          transaction_time: transaction_time,
          transaction_id: transaction_id
        }
      )
      
      if (!insertResult || !insertResult[0]?.id) {
        throw new Error('Gagal insert data pembayaran')
      }
      
      console.log('Insert data pembayaran berhasil:', { 
        pembayaran_id: insertResult[0].id,
        order_id, 
        gross_amount 
      })
    } catch (insertError) {
      console.error('Error insert pembayaran:', insertError)
      throw new Error(`Gagal insert data pembayaran: ${insertError.message}`)
    }

    // Update status pembayaran di database
    try {
      console.log('Memulai update status tagihan:', { order_id, transaction_status })
      const updateResult = await executeQuery(
        `UPDATE tagihan SET 
          midtrans_status = $[transaction_status],
          midtrans_transaction_time = $[transaction_time],
          midtrans_transaction_id = $[transaction_id],
          midtrans_payment_type = $[payment_type],
          midtrans_settlement_time = $[settlement_time],
          midtrans_expiry_time = $[expiry_time],
          midtrans_approval_code = $[approval_code],
          status = CASE WHEN $[transaction_status] = 'capture' OR $[transaction_status] = 'settlement' THEN 'paid' ELSE status END
        WHERE midtrans_order_id = $[order_id] RETURNING id`,
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
      
      if (!updateResult || updateResult.length === 0) {
        throw new Error('Tagihan tidak ditemukan')
      }
      
      console.log('Update status tagihan berhasil:', { 
        tagihan_id: updateResult[0].id,
        order_id, 
        transaction_status 
      })
    } catch (updateError) {
      console.error('Error update tagihan:', updateError)
      throw new Error(`Gagal update status tagihan: ${updateError.message}`)
    }
    
    // Insert ke tabel pembayaran jika status settlement
    if (transaction_status === 'settlement') {
      console.log('Memulai insert data pembayaran:', { order_id, gross_amount })
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
          console.log('Insert data pembayaran selesai:', { order_id, gross_amount })
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