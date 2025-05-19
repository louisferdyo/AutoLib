// app/api/locker_schedules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {createServerSupabaseClient} from '../../../../lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await req.json();
    const { locker_id, start_time, user_id, transaction_id} = body;

    if (!locker_id || !start_time || !user_id || !transaction_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const start = new Date(start_time);
    if (isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Invalid start_time' }, { status: 400 });
    }
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // tambah 2 jam

    // Ambil nama locker
    const { data: locker, error: lockerError } = await supabase
      .from('lockers')
      .select('locker_name')
      .eq('id', locker_id)
      .single();

    if (lockerError || !locker) {
      return NextResponse.json({ error: 'Locker not found' }, { status: 404 });
    }

    // Insert ke locker_schedules
    const { data, error } = await supabase.from('locker_schedules').insert([
      {
        locker_id,
        locker_name: locker.locker_name,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        user_id,
        transaction_id,
        status: 'scheduled',
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Locker schedule saved', data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
