'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../lib/supabase';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_image_url: string;
  categories: string[];
  available_quantity: number;
  average_rating: number | null;
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkSessionAndFetch() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);

      // Fetch rekomendasi
      try {
        const res = await fetch(`/api/recommendations/${session.user.id}?limit=5`);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        const data: Book[] = await res.json();
        setRecommendedBooks(data);
      } catch (e: any) {
        setError(e.message || 'Error fetching recommendations');
      } finally {
        setLoading(false);
      }
    }

    checkSessionAndFetch();
  }, [router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  const goToBooks = () => {
    // Kirim userId ke halaman buku
    router.push(`/books?user_id=${userId}`);
  };

  // const goToBorrow = (bookId: string) => {
  //   // Kirim userId dan bookId ke halaman borrowBooks
  //   router.push(`/borrow-books?id=${bookId}&user_id=${userId}`);
  // };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>
      <p className="mb-4">
        Your User ID: <span className="font-mono">{userId}</span>
      </p>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={goToBooks}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          📚 Go to Books Page
        </button>

        <button
          onClick={() => router.push('/profile')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          👤 Go to Profile Page
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-3">Recommended Books For You</h2>
      {recommendedBooks.length === 0 ? (
        <p>No recommendations available.</p>
      ) : (
        <ul className="space-y-4">
          {recommendedBooks.map(book => (
            <li
              key={book.id}
              className="border p-4 rounded flex space-x-4 items-center"
            >
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-16 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-bold">{book.title}</h3>
                <p className="text-sm text-gray-600">by {book.author}</p>
                <p className="text-sm">
                  Categories: {book.categories.join(', ')}
                </p>
                <p className="text-sm">
                  Available: {book.available_quantity}
                </p>
                <p className="text-sm">
                  Rating: {book.average_rating !== null ? book.average_rating.toFixed(1) : 'N/A'}
                </p>
              </div>
              {/* <button
                onClick={() => goToBorrow(book.id)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
              >
                Pinjam
              </button> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
