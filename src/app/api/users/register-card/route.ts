import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, card_id } = body;

    console.log('Received card registration:', { user_id, card_id });

    if (!user_id || !card_id) {
      return NextResponse.json(
        { error: 'user_id dan card_id diperlukan' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Cek apakah user exists
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

    // Cek apakah card_id sudah digunakan user lain
    const { data: existingCard, error: cardError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('card_id', card_id)
      .neq('id', user_id)
      .maybeSingle();

    if (cardError && cardError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing card:', cardError);
      return NextResponse.json(
        { error: 'Error checking existing card: ' + cardError.message },
        { status: 500 }
      );
    }

    if (existingCard) {
      return NextResponse.json(
        { error: 'Card ID sudah digunakan oleh user lain: ' + existingCard.full_name },
        { status: 409 }
      );
    }

    // Update user dengan card_id baru
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ card_id: card_id })
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Error updating user: ' + updateError.message },
        { status: 500 }
      );
    }

    console.log('Card registered successfully:', updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Card berhasil didaftarkan untuk ' + updatedUser.full_name,
      user: updatedUser
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}