import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, rating } = await req.json();

    if (!bookId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 });
    }

    // Check if user has already rated this book
    const { data: existingRating, error: checkError } = await supabase
      .from('book_ratings')
      .select('id')
      .eq('book_id', bookId)
      .eq('user_id', session.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      return NextResponse.json({ error: 'Error checking existing rating' }, { status: 500 });
    }

    let result;
    if (existingRating) {
      // Update existing rating
      result = await supabase
        .from('book_ratings')
        .update({ rating })
        .eq('id', existingRating.id)
        .select()
        .single();
    } else {
      // Insert new rating
      result = await supabase
        .from('book_ratings')
        .insert({
          book_id: bookId,
          user_id: session.user.id,
          rating
        })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error('Error rating book:', error);
    return NextResponse.json(
      { error: error.message || 'Error submitting rating' },
      { status: 500 }
    );
  }
}