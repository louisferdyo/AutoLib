// src/app/api/books/[id]/route.ts
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = createServerSupabaseClient();
    const bookId = params.id;
    
    // Get book details
    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
      
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!book) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    return Response.json({ book }, { status: 200 });
  } catch (err) {
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}