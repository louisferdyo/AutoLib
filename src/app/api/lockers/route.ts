import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabaseServer';

export async function GET() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('lockers')
    .select('id, rfid_id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
