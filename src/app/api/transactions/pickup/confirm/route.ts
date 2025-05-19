// app/api/transactions/pickup/confirm/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { confirmBookPickup } from '../../../../../../lib/services/transactionService'
import { createServerSupabaseClient } from '../../../../../../lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    // 1. Validasi body
    const body = await request.json()
    const { transactionId }: { transactionId?: string } = body

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing required field: transactionId' },
        { status: 400 }
      )
    }

    // 2. Ambil session user
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to confirm pickup.' },
        { status: 401 }
      )
    }

    // 3. Proses konfirmasi
    const result = await confirmBookPickup(transactionId)

    // 4. Response
    return NextResponse.json(
      {
        success: true,
        message: 'Book pickup confirmed successfully',
        data: {
          transactionId: result.transaction.id,
          status: result.transaction.status
        }
      },
      { status: 200 }
    )
  } catch (e: any) {
    console.error('Error in confirm pickup API:', e)
    const statusCode = e.message?.includes('not found') ? 404 : 500
    return NextResponse.json(
      { error: e.message ?? 'An error occurred while confirming book pickup' },
      { status: statusCode }
    )
  }
}
