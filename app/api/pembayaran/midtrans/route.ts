import { NextResponse } from "next/server"
// @ts-ignore
import midtransClient from "midtrans-client"
import { executeQuery } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    const { tagihan_id, siswa_id, amount, customer_details, payment_type } = body

    // Validate Midtrans credentials
    if (!process.env.MIDTRANS_SERVER_KEY_SANDBOX || !process.env.MIDTRANS_CLIENT_KEY_SANDBOX) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Konfigurasi Midtrans tidak lengkap",
          details: "Pastikan MIDTRANS_SERVER_KEY_SANDBOX dan MIDTRANS_CLIENT_KEY_SANDBOX telah diatur di environment variables"
        },
        { status: 500 }
      );
    }

    // Validate credential format
    if (!process.env.MIDTRANS_SERVER_KEY_SANDBOX.startsWith('SB-Mid-server-') && 
        !process.env.MIDTRANS_SERVER_KEY_SANDBOX.startsWith('Mid-server-')) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Format Server Key Midtrans tidak valid",
          details: "Server Key harus diawali dengan 'SB-Mid-server-' (sandbox) atau 'Mid-server-' (production)"
        },
        { status: 500 }
      );
    }

    // Initialize Midtrans client with Basic Auth
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY_SANDBOX,
      clientKey: process.env.MIDTRANS_CLIENT_KEY_SANDBOX,
      merchantId: "G174701979",
      httpClient: {
        request: async (options: { headers: any }) => {
          // Add Basic Auth header
          const auth = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY_SANDBOX}:`).toString('base64')
          options.headers = {
            ...options.headers,
            'Authorization': `Basic ${auth}`
          }
          
          // Use default fetch implementation
          return midtransClient.httpClient.nodeHttpClient.request(options)
        }
      }
    })

    // Create transaction parameters
    const parameter = {
      transaction_details: {
        order_id: `SPP-${tagihan_id}-${Date.now()}`,
        gross_amount: amount
      },
      customer_details,
      credit_card: {
        secure: true
      }
    }

    // Log transaction parameters before sending to Midtrans
    console.log('Contoh body request standar Midtrans:', JSON.stringify({
      transaction_details: {
        order_id: `SPP-${tagihan_id}-${Date.now()}`,
        gross_amount: amount
      },
      customer_details: {
        first_name: customer_details.first_name,
        email: customer_details.email,
        phone: customer_details.phone
      },
      item_details: [{
        id: `SPP-${tagihan_id}`,
        price: amount,
        quantity: 1,
        name: `SPP ${new Date().getFullYear()}`
      }],
      credit_card: {
        secure: true
      }
    }, null, 2))
    
    console.log('Midtrans request parameters:', JSON.stringify(parameter, null, 2))
    
    // Create transaction
    const transaction = await snap.createTransaction(parameter)
    const paymentUrl = transaction.redirect_url

    // Update database with transaction details
    await executeQuery(
      `UPDATE tagihan SET 
        midtrans_transaction_id = $1,
        midtrans_status = 'pending',
        midtrans_payment_type = $3,
        midtrans_transaction_time = NOW()
      WHERE id = $2`,
      [parameter.transaction_details.order_id, tagihan_id, payment_type]
    )

    return new NextResponse(JSON.stringify({
      success: true,
      payment_url: paymentUrl
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  } catch (error) {
    console.error("Error creating Midtrans payment:", error)
    
    // Handle specific Midtrans authentication error
    if ((error as any)?.httpStatusCode === 401) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Autentikasi Midtrans gagal",
          details: "Pastikan Server Key dan Client Key Midtrans valid dan sesuai dengan environment (sandbox/production)"
        },
        { status: 401 }
      );
    }
    
    return new NextResponse(JSON.stringify({
        success: false, 
        message: "Gagal membuat pembayaran",
        details: error?.message || "Terjadi kesalahan saat memproses pembayaran"
      }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      })
  }
}