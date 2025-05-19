import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer'

export async function GET(req: Request): Promise<NextResponse> {
  const supabase = createServerSupabaseClient()
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');


  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        books:book_id(*),
        lockers:locker_id(*)
      `)
      .eq('user_id', userId)
      .in('status', ['finished', 'canceled', 'late'])
      .order('scheduled_pickup_time', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = data.map((tx: any) => ({
      ...tx,
      status_label:
        tx.status === 'finished' ? 'Selesai' :
        tx.status === 'canceled' ? 'Dibatalkan' :
        tx.status === 'late' ? 'Terlambat' :
        tx.status
    }))

    return NextResponse.json({ data: formatted }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
