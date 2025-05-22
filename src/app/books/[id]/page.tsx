'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useBorrowStore } from '../../../stores/useBorrowState';
import BookRating from '../../../component/BookRating';
import { createClient } from '../../../lib/supabase';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  synopsis: string;
  categories: string[];
  cover_image_url: string;
  available_quantity: number;
  total_quantity: number;
}

export default function BookDetailPage() {
  const router = useRouter();
  const setBookId = useBorrowStore((state: any) => state.setBookId);
   
  const params = useParams();
  const id = params?.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // states untuk tombol pinjam
  const [borrowing, setBorrowing] = useState(false);
  const [borrowError, setBorrowError] = useState<string | null>(null);
  const [borrowSuccess, setBorrowSuccess] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [canRate, setCanRate] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/books/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.book) setBook(data.book);
        else setError(data.error || 'Failed to fetch book details');
      })
      .catch(() => setError('An unexpected error occurred'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    async function checkRatingEligibility() {
      if (!id) return;
      
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) return;

        // Check if user has borrowed and returned this book
        const { data: transactions } = await supabase
          .from('transactions')
          .select('status')
          .eq('book_id', id)
          .eq('user_id', session.user.id)
          .eq('status', 'finished')
          .limit(1);

        setCanRate(transactions && transactions.length > 0);
      } catch (error) {
        console.error('Error checking rating eligibility:', error);
      }
    }

    checkRatingEligibility();
  }, [id]);
  
  const handleBorrow = () => {
    if (!book) return;
    setBookId(book.id);
    router.push('/borrowBooks');
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );

  if (error || !book) return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error || 'Book not found'}</p>
      </div>
      <div className="mt-4">
        <Link href="/books" className="text-blue-500 hover:underline">
          &larr; Back to Books
        </Link>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/books" className="text-blue-500 hover:underline">
          &larr; Back to Books
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
        <div className="md:w-1/3 bg-gray-200">
          <div className="relative h-96 md:h-full w-full">
            {book.cover_image_url ? (
              <Image
                src={book.cover_image_url}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                No Cover Image
              </div>
            )}
          </div>
        </div>

        <div className="md:w-2/3 p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <h2 className="text-xl text-gray-600 mb-4">by {book.author}</h2>

          {canRate && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-indigo-700 mb-2">Beri Penilaian</h3>
              <BookRating 
                bookId={book.id} 
                onRatingSubmit={(rating) => setUserRating(rating)}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {book.categories?.map(cat => (
              <span
                key={cat}
                className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">ISBN</p>
            <p>{book.isbn}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Availability</p>
            <p className={book.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
              {book.available_quantity} of {book.total_quantity} copies available
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Synopsis</p>
            <p className="text-gray-700 whitespace-pre-line">{book.synopsis}</p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleBorrow}
              disabled={book.available_quantity === 0 || borrowing}
              className={`inline-block px-6 py-3 rounded-lg text-white font-semibold ${
                book.available_quantity > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 pointer-events-none'
              }`}
            >
              {borrowing ? 'Memproses...' : 'Pinjam Buku'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}