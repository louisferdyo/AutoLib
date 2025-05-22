import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    console.log('Received user_id:', user_id);

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verifikasi user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, card_id')
      .eq('id', user_id)
      .maybeSingle();

    if (userError) {
      console.error('Database error:', userError);
      return NextResponse.json(
        { error: 'Database error: ' + userError.message },
        { status: 500 }
      );
    }

    if (!userData) {
      console.error('User not found for ID:', user_id);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Found user:', userData);

    // Check if user already has a card
    if (userData.card_id) {
      return NextResponse.json(
        { error: 'User sudah memiliki kartu terdaftar' },
        { status: 400 }
      );
    }

    // TODO: Send request to ESP32
    // Untuk sementara, kita simulasikan pengiriman ke ESP32
    console.log('Sending registration request to ESP32 for user:', userData.full_name);
    
    // Simulasi komunikasi dengan ESP32
    // Ganti ini dengan actual HTTP request ke ESP32
    const esp32Response = await sendToESP32(user_id, userData);

    if (!esp32Response.success) {
      return NextResponse.json(
        { error: 'Gagal mengirim permintaan ke ESP32: ' + esp32Response.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Permintaan registrasi berhasil dikirim ke ESP32. Silakan tempatkan kartu pada pembaca.',
      user: userData
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Function untuk komunikasi dengan ESP32
async function sendToESP32(user_id: string, userData: any) {
  try {
    // Ganti dengan IP address ESP32 yang sebenarnya
    const ESP32_URL = 'http://192.168.1.100'; // Sesuaikan dengan IP ESP32 Anda
    
    const response = await fetch(`${ESP32_URL}/register-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        full_name: userData.full_name,
        email: userData.email
      }),
      // Timeout untuk menghindari hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`ESP32 responded with status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error communicating with ESP32:', error);
    
    // Untuk development, kita return success agar bisa test
    // Hapus ini ketika ESP32 sudah siap
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating ESP32 success');
      return { success: true, data: { message: 'Simulated ESP32 response' } };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}