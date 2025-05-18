// lib/services/bookService.ts
import  supabase  from '../supabase';

interface Book {
  id: string;
  title?: string;
  author?: string;
  available_quantity: number;
  total_quantity?: number;
}

/**
 * Result dari updateBookAvailability
 */
interface UpdateAvailabilityResult {
  success: boolean;
  availableQuantity: number;
}

/**
 * Result dari checkBookAvailability
 */
interface CheckAvailabilityResult {
  book: Book | null;
  isAvailable: boolean;
}

/**
 * Memperbaharui ketersediaan buku
 */
export async function updateBookAvailability(
  bookId: string,
  incrementBy = -1
): Promise<UpdateAvailabilityResult> {
  try {
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('available_quantity, total_quantity')
      .eq('id', bookId)
      .single();

    if (fetchError || !book) {
      console.error('Error fetching book:', fetchError);
      throw fetchError ?? new Error('Book not found');
    }

    const newQuantity = book.available_quantity + incrementBy;

    if (newQuantity < 0) {
      throw new Error('Cannot reduce available quantity below 0');
    }
    if (book.total_quantity !== undefined && newQuantity > book.total_quantity) {
      throw new Error('Cannot increase available quantity above total quantity');
    }

    const { error: updateError } = await supabase
      .from('books')
      .update({ available_quantity: newQuantity })
      .eq('id', bookId);

    if (updateError) {
      console.error('Error updating book availability:', updateError);
      throw updateError;
    }

    return { success: true, availableQuantity: newQuantity };
  } catch (error) {
    console.error('Error in updateBookAvailability:', error);
    throw error;
  }
}

/**
 * Memeriksa ketersediaan buku
 */
export async function checkBookAvailability(bookId: string): Promise<CheckAvailabilityResult> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('id, title, author, available_quantity')
      .eq('id', bookId)
      .single();

    if (error) {
      console.error('Error checking book availability:', error);
      throw error;
    }

    return {
      book: data,
      isAvailable: (data?.available_quantity ?? 0) > 0
    };
  } catch (error) {
    console.error('Error in checkBookAvailability:', error);
    throw error;
  }
}
