import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  
  
  try {
    const supabase = createServerSupabaseClient();
    const bookId = params.id;
    
    if (!bookId) {
      return new Response(
        JSON.stringify({ error: 'Book ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get book details
    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
      
    if (error) {
      console.error('Error fetching book details:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch book details' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!book) {
      return new Response(
        JSON.stringify({ error: 'Book not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ book }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}