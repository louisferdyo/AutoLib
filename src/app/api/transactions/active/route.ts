// app/api/transactions/active/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer'

export async function GET(req: Request): Promise<NextResponse> {
  // Supabase client yang sudah benar baca cookie auth
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
      .eq('status', ['active', 'waiting', 'late', 'canceled'])
      .order('scheduled_pickup_time', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
