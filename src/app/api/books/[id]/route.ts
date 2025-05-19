// src/app/api/books/[id]/route.ts
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

// Menggunakan pendekatan tanpa meneruskan parameter atau tipe (param langsung dari URL)
export async function GET(request: Request) {
  try {
    // Extract ID dari URL secara manual
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const bookId = pathParts[pathParts.length - 1]; // Ambil ID dari bagian terakhir URL
    
    const supabase = createServerSupabaseClient();
    
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

    return Response.json({ book });
  } catch (err) {
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}