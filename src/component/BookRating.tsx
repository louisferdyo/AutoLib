import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';

interface BookRatingProps {
  bookId: string;
  initialRating?: number | null;
  onRatingSubmit?: (rating: number) => void;
  className?: string;
}

export default function BookRating({ bookId, initialRating, onRatingSubmit, className = '' }: BookRatingProps) {
  const [rating, setRating] = useState<number | null>(initialRating || null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Fetch user's existing rating if not provided
    if (initialRating === undefined) {
      fetchUserRating();
    }
  }, [bookId]);

  const fetchUserRating = async () => {
    try {
      const response = await fetch(`/api/books/ratings/user?bookId=${bookId}`);
      const data = await response.json();
      if (response.ok && data.rating) {
        setRating(data.rating);
      }
    } catch (err) {
      console.error('Error fetching rating:', err);
    }
  };

  const handleRatingSubmit = async (newRating: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/books/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, rating: newRating }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating');
      }

      setRating(newRating);
      if (onRatingSubmit) {
        onRatingSubmit(newRating);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={loading}
            onClick={() => handleRatingSubmit(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            className={`p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-transform ${
              loading ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'
            }`}
          >
            <svg
              className={`w-8 h-8 ${
                (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } transition-colors duration-200`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-2 text-sm text-indigo-600">
          Menyimpan penilaian...
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {rating && !loading && !error && (
        <div className="mt-2 text-sm text-indigo-600">
          Penilaian Anda: {rating} bintang
        </div>
      )}
    </div>
  );
}