// app/api/lockers/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeParam = searchParams.get('time');

    if (!timeParam) {
      return NextResponse.json({ error: 'Missing time parameter' }, { status: 400 });
    }

    const time = new Date(timeParam);
    if (isNaN(time.getTime())) {
      return NextResponse.json({ error: 'Invalid time value' }, { status: 400 });
    }
    const timeIso = time.toISOString();
    // Ambil locker_id yang sedang sibuk pada waktu itu dan tidak dibatalkan
    const { data: busy, error: busyError } = await supabase
      .from('locker_schedules')
      .select('locker_id')
      .lt('start_time', timeIso)
      .gt('end_time', timeIso)
      // .neq('status', 'canceled');  // abaikan yang dibatalkan
    
    if (busyError) throw busyError;

    const busyIds = busy?.map(r => r.locker_id) ?? [];
    
    // Ambil semua locker dari tabel lockers
    const { data: allLockers, error: allError } = await supabase
      .from('lockers')
      .select('id, locker_name');

    if (allError) throw allError;

    // Filter hanya locker yang tidak masuk daftar sibuk
    const availableLockers = allLockers.filter(locker => !busyIds.includes(locker.id));

    return NextResponse.json({ lockers: availableLockers }, { status: 200 });

  } catch (e: any) {
    console.error('Error /api/lockers/available:', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
