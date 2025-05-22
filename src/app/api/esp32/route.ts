import { NextRequest, NextResponse } from 'next/server';

// Get ESP32 IP from environment variable
const ESP32_IP = process.env.ESP32_IP || '192.168.84.238';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`http://${ESP32_IP}`, { method: 'GET' });
    const text = await response.text();            // baca sebagai teks
    let data: any;

    try {
      data = JSON.parse(text);                     // coba parse jadi JSON
    } catch {
      data = { raw: text };                        // kalau gagal, bungkus di properti `raw`
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error communicating with ESP32:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with ESP32', details: error.message },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, user_id } = body;

    if (action === 'registerCard') {
      // Forward registration request to ESP32
      const response = await fetch(`http://${ESP32_IP}/registerCard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        return NextResponse.json({ 
          error: 'ESP32 rejected the request', 
          details: errorData 
        }, { status: response.status });
      }

      const responseData = await response.json().catch(() => ({ status: 'waiting_for_card' }));
      return NextResponse.json({
        message: 'Registration request sent to ESP32',
        ...responseData
      }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in ESP32 proxy:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with ESP32', details: error.message }, 
      { status: 500 }
    );
  }
}