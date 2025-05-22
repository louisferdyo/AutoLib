import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('book_ratings')
      .select('rating')
      .eq('book_id', bookId)
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      throw error;
    }

    return NextResponse.json({ rating: data?.rating || null });
  } catch (error: any) {
    console.error('Error fetching user rating:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching rating' },
      { status: 500 }
    );
  }
}