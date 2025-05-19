// app/api/books/update-quantity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await req.json();
    const { book_id, change } = body;

    if (!book_id || change === undefined) {
      return NextResponse.json({ error: 'Missing book_id or change parameter' }, { status: 400 });
    }

    // Ambil stok buku saat ini
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('available_quantity')
      .eq('id', book_id)
      .single();

    if (fetchError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const currentQty = book.available_quantity;

    // Jika sedang mengurangi dan stok sudah 0, langsung tolak
    if (change < 0 && currentQty === 0) {
      return NextResponse.json({ error: 'Stok buku sudah habis' }, { status: 400 });
    }

    const newQuantity = currentQty + change;

    if (newQuantity < 0) {
      return NextResponse.json({ error: 'Not enough books available' }, { status: 400 });
    }

    // Update kuantitas
    const { data, error } = await supabase
      .from('books')
      .update({ available_quantity: newQuantity })
      .eq('id', book_id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Book quantity updated successfully',
      data,
      new_quantity: newQuantity
    }, { status: 200 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
