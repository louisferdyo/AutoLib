import { NextRequest, NextResponse } from 'next/server';
import {createServerSupabaseClient} from '../../../../lib/supabaseServer';

// Get all books with optional pagination and filtering
export async function GET(request: NextRequest) {
   const supabase = createServerSupabaseClient()
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let queryBuilder = supabase
      .from('books')
      .select('*', { count: 'exact' });

    // Apply search filter if query parameter exists
    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%`
      );
    }

    // Filter by category if provided
    if (category) {
      queryBuilder = queryBuilder.contains('categories', [category]);
    }

    // Execute query with pagination
    const { data: books, count, error } = await queryBuilder
      .order('title')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching books:', error);
      return NextResponse.json(
        { error: 'Failed to fetch books' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      books,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}



