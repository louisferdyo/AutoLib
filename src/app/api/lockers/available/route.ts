import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';
export async function GET(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const timeParam = searchParams.get('time');

    if (!timeParam) {
      return NextResponse.json({ error: 'Missing time parameter' }, { status: 400 });
    }

    const startInterval = new Date(timeParam);
    if (isNaN(startInterval.getTime())) {
      return NextResponse.json({ error: 'Invalid time value' }, { status: 400 });
    }

    // Hitung waktu selesai interval (start + 2 jam)
    const endInterval = new Date(startInterval.getTime() + 2 * 60 * 60 * 1000);

    const startIso = startInterval.toISOString();
    const endIso = endInterval.toISOString();

    // Cari locker yang jadwalnya bentrok dengan interval [startInterval, endInterval]
    const { data: busy, error: busyError } = await supabase
      .from('locker_schedules')
      .select('locker_id')
      .lt('start_time', endIso)    // start_time < endInterval
      .gt('end_time', startIso)    // end_time > startInterval
      .neq('status', 'canceled');  // abaikan yang status canceled

    if (busyError) throw busyError;

    const busyIds = busy?.map(r => r.locker_id) ?? [];

    // Ambil semua locker
    const { data: allLockers, error: allError } = await supabase
      .from('lockers')
      .select('id, locker_name');

    if (allError) throw allError;

    // Filter locker yang tidak bentrok (tidak ada di busyIds)
    const availableLockers = allLockers.filter(locker => !busyIds.includes(locker.id));

    return NextResponse.json({ lockers: availableLockers }, { status: 200 });

  } catch (e: any) {
    console.error('Error /api/lockers/available:', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
