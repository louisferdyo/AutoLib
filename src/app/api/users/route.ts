import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, card_id')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(userData, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}