'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
  const params = useParams();
  const id = params?.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // states untuk tombol pinjam
  const [borrowing, setBorrowing] = useState(false);
  const [borrowError, setBorrowError] = useState<string | null>(null);
  const [borrowSuccess, setBorrowSuccess] = useState<boolean>(false);

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

  const handleBorrow = async () => {
    if (!book) return;
    setBorrowing(true);
    setBorrowError(null);
    // set jadwal: sekarang dan +7 hari
    const now = new Date();
    const later = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    try {
      const res = await fetch('/api/transactions/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          // backend akan ambil user_id dari session
          scheduledPickup: now.toISOString(),
          scheduledReturn: later.toISOString(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to borrow book');
      }
      setBorrowSuccess(true);
      // redirect ke halaman history, misal:
      setTimeout(() => router.push('/transactions/history'), 1500);
    } catch (e: any) {
      setBorrowError(e.message);
    } finally {
      setBorrowing(false);
    }
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

          {/* Tombol Pinjam */}
          <div className="mt-6">
            <Link
              href={`/borrowBooks?id=${book.id}`}
              className={`inline-block px-6 py-3 rounded-lg text-white font-semibold ${
                book.available_quantity > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 pointer-events-none'
              }`}
            >
              Pinjam Buku
            </Link>
        </div>

        </div>
      </div>
    </div>
  );
}
