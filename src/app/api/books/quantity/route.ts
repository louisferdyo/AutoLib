import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('id');

    if (!bookId) {
      return NextResponse.json({ error: 'Missing book id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('books')
      .select('available_quantity')
      .eq('id', bookId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ available_quantity: data.available_quantity }, { status: 200 });
  } catch (e: any) {
    console.error('Error /api/books/quantity:', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
