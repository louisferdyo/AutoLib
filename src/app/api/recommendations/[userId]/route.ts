import { NextRequest, NextResponse } from 'next/server';
import  {createServerSupabaseClient} from '../../../../../lib/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { userId } = params;
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '5');

    // Ambil riwayat aktivitas user
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('book_id')
      .eq('user_id', userId)
      .in('activity_type', ['borrow', 'read']) // sesuaikan jika perlu
      .order('created_at', { ascending: false })
      .limit(20);

    if (activitiesError) throw activitiesError;

    const bookIds = activities.map(a => a.book_id);

    let userCategories: string[] = [];

    if (bookIds.length > 0) {
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('categories')
        .in('id', bookIds);

      if (booksError) throw booksError;

      // Ekstrak semua kategori dari hasil buku
      books.forEach(book => {
        if (book.categories && Array.isArray(book.categories)) {
          userCategories.push(...book.categories);
        }
      });

      // Hapus duplikat
      userCategories = [...new Set(userCategories)];
    }

    // Query buku rekomendasi
    let query = supabase
      .from('books')
      .select('*, book_ratings(rating)')
      .gt('available_quantity', 0);

    if (userCategories.length > 0) {
      query = query.overlaps('categories', userCategories);
    }

    const { data: recommendedBooks, error } = await query
      .limit(limit)
      .order('title');

    if (error) throw error;

    // Hitung rata-rata rating
    const processedBooks = recommendedBooks.map(book => {
      const ratings = book.book_ratings || [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) /
            ratings.length
          : null;

      return {
        id: book.id,
        title: book.title,
        author: book.author,
        cover_image_url: book.cover_image_url,
        categories: book.categories,
        available_quantity: book.available_quantity,
        average_rating: avgRating,
      };
    });

    return NextResponse.json(processedBooks);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
