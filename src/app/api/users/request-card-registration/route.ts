// File: app/api/users/request-card-registration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export async function POST(req: NextRequest) {
  // parse body
  let body: { user_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { user_id } = body;
  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id parameter' }, { status: 400 });
  }

  // Supabase client
  const supabase = createServerSupabaseClient();
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Pastikan user ada
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user_id)
    .single();
  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Baca ESP32 IP dari ENV
  const esp32Ip = process.env.ESP32_IP;
  if (!esp32Ip) {
    console.error('🚨 ESP32_IP env var not set!');
    return NextResponse.json({ error: 'ESP32 IP not configured' }, { status: 500 });
  }

  // Kirim ke ESP32
  try {
    const espRes = await fetch(`http://${esp32Ip}/registerCard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!espRes.ok) {
      const details = await espRes.text();
      console.error('ESP32 rejected:', details);
      return NextResponse.json(
        { error: 'ESP32 rejected the request', details },
        { status: espRes.status }
      );
    }

    const data = await espRes.json();
    return NextResponse.json(
      { message: 'Registration request sent to ESP32', data },
      { status: 200 }
    );

  } catch (err: any) {
    console.error('Error communicating with ESP32:', err);
    return NextResponse.json(
      { error: 'Failed to communicate with ESP32', details: err.message },
      { status: 500 }
    );
  }
}
