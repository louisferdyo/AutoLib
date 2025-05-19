import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request): Promise<NextResponse> {
  // Initialize Supabase client with cookies for auth
  const supabase = createServerSupabaseClient();

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body
  const { book_id, locker_id, scheduled_pickup_time, scheduled_return_time } = await req.json();

  // Validate required fields
  if (!book_id || !locker_id || !scheduled_pickup_time || !scheduled_return_time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate return time is at least 3 hours after pickup
  const pickup = new Date(scheduled_pickup_time);
  const returnTime = new Date(scheduled_return_time);
  const diffHours = (returnTime.getTime() - pickup.getTime()) / (1000 * 60 * 60);

  if (diffHours < 3) {
    return NextResponse.json(
      { error: 'Waktu pengembalian harus minimal 3 jam setelah pengambilan.' },
      { status: 400 }
    );
  }

  try {
    // Insert new borrow transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        book_id,
        locker_id,
        transaction_type: 'borrow',
        scheduled_pickup_time: pickup.toISOString(),
        scheduled_return_time: returnTime.toISOString(),
        actual_pickup_time: null,
        actual_return_time: null,
        status: 'active',
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Borrow transaction created', data },
      { status: 200 }
    );

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
