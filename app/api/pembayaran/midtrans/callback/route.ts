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
      .digest('hex')

    // Validasi signature key
    if (signature_key !== generatedSignature) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Signature key tidak valid"
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

    // Response sederhana untuk Midtrans
    return NextResponse.json(
      { status: "ok" },
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