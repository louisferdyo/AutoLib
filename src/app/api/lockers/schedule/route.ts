// app/api/lockers/schedule/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserActiveLockerSchedules } from '../../../../..//lib/services/lockerService'
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    // 1. Ambil session user
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to view locker schedules.' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. Query jadwal loker
    const lockerSchedules = await getUserActiveLockerSchedules(userId)

    // 3. Response sukses
    return NextResponse.json(
      { success: true, data: lockerSchedules },
      { status: 200 }
    )
  } catch (e: any) {
    console.error('Error in locker schedules API:', e)
    return NextResponse.json(
      { error: e.message ?? 'An error occurred while fetching locker schedules' },
      { status: 500 }
    )
  }
}
