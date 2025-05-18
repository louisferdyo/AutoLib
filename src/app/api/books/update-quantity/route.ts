// app/api/books/update-quantity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { book_id, change } = body;

    if (!book_id || change === undefined) {
      return NextResponse.json({ error: 'Missing book_id or change parameter' }, { status: 400 });
    }

    // First, get current available quantity
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('available_quantity')
      .eq('id', book_id)
      .single();

    if (fetchError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const newQuantity = book.available_quantity + change;
    
    // Don't allow negative quantities
    if (newQuantity < 0) {
      return NextResponse.json({ error: 'Not enough books available' }, { status: 400 });
    }

    // Update the book's available quantity
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