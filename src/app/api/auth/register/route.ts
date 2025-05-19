// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import {createServerSupabaseClient} from '../../../../../lib/supabaseServer' 

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const generateRFID = () => {
      return 'RFID-' + Math.random().toString(16).slice(2, 12).toUpperCase();
    };

    // 1. Register via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // 2. Insert to users (tanpa id manual, biarkan auto increment)
    const { data: userInsertResult, error: userInsertError } = await supabase
      .from('users')
      .insert({
        email,
        full_name: fullName || '',
        role: 'user',
      })
      .select('id')
      .single();

    if (userInsertError) {
      // rollback: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: userInsertError.message }, { status: 400 });
    }

    const generatedCardId = generateRFID();

    // 3. Insert to rfid_cards
    const { error: rfidError } = await supabase.from('rfid_cards').insert({
      user_id: userInsertResult.id,
      card_id: generatedCardId,
      is_active: true,
    });

    if (rfidError) {
      // rollback user + auth user
      await supabase.from('users').delete().eq('id', userInsertResult.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: rfidError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: userInsertResult.id,
        email,
        card_id: generatedCardId,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
