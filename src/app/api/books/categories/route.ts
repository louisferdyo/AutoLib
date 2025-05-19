import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient();
  
  try {
    // Get all books
    const { data: books, error } = await supabase
      .from('books')
      .select('categories');
      
    if (error) {
      console.error('Error fetching book categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch book categories' },
        { status: 500 }
      );
    }
    
    // Extract and flatten all categories
    const allCategories = books.flatMap(book => book.categories || []);
    
    // Remove duplicates
    const uniqueCategories = [...new Set(allCategories)].sort();
    
    return NextResponse.json({ categories: uniqueCategories });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}