'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {createClient} from '../../../lib/supabase';

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
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
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
      
      // Fetch user name
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
          
        if (!userError && userData) {
          setUserName(userData.full_name);
        }
      } catch (e) {
        // Continue anyway if we can't get the name
      }

      // Fetch rekomendasi
      try {
        const res = await fetch(`/api/recommendations/?limit=5`);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 font-sans">
      {/* Header/Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-purple-600 hover:text-purple-800 transition duration-300">
                  <span className="text-indigo-600">Auto</span>Lib
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-indigo-600 hover:text-indigo-800 transition duration-300 text-sm font-medium"
              >
                Profil
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded-lg transition duration-300 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Decorative circles */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10 flex-grow">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 max-w-3xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Error: {error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Welcome Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-6 mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-2">Selamat Datang, {userName || 'Pengguna'}!</h1>
              <p className="text-indigo-600 mb-4">
                Selamat datang di dashboard AutoLib, tempat Anda dapat menjelajahi buku, meminjam, dan mengelola aktivitas perpustakaan Anda.
              </p>
              <div className="bg-indigo-50/80 backdrop-blur-sm p-3 rounded-lg text-sm text-indigo-700 font-mono inline-block">
                ID Pengguna: {userId}...
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <button
                onClick={() => router.push(`/books?user_id=${userId}`)}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-indigo-100 transition duration-300 hover:shadow-lg hover:scale-105 text-left"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-indigo-800">Jelajahi Buku</h2>
                </div>
                <p className="text-indigo-600 text-sm">Temukan dan cari buku dari koleksi perpustakaan kami.</p>
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-indigo-100 transition duration-300 hover:shadow-lg hover:scale-105 text-left"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-indigo-800">Profil Saya</h2>
                </div>
                <p className="text-indigo-600 text-sm">Lihat dan edit informasi profil Anda.</p>
              </button>

              <button
                onClick={() => router.push(`/transactions/active?user_id=${userId}`)}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-indigo-100 transition duration-300 hover:shadow-lg hover:scale-105 text-left"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-indigo-800">Transaksi Aktif</h2>
                </div>
                <p className="text-indigo-600 text-sm">Lihat peminjaman buku aktif dan riwayat Anda.</p>
              </button>

              <button
                onClick={() => router.push(`/transactions/history?user_id=${userId}`)}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-indigo-100 transition duration-300 hover:shadow-lg hover:scale-105 text-left"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-indigo-800">Riwayat</h2>
                </div>
                <p className="text-indigo-600 text-sm">Lihat riwayat peminjaman buku Anda.</p>
              </button>
            </div>

            {/* Recommended Books */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-6 mb-8">
              <h2 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Rekomendasi Untuk Anda
              </h2>
              
              {recommendedBooks.length === 0 ? (
                <div className="text-center py-8 text-indigo-600">
                  <svg className="mx-auto h-12 w-12 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>Belum ada rekomendasi tersedia. Coba pinjam beberapa buku terlebih dahulu!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedBooks.map(book => (
                    <div 
                      key={book.id}
                      className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border border-indigo-100 transition-all duration-300 hover:shadow-lg hover:scale-102"
                    >
                      <div className="relative h-40 bg-indigo-50">
                        {book.cover_image_url ? (
                          <img 
                            src={book.cover_image_url} 
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-indigo-300">
                            <svg className="h-16 w-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        {book.average_rating !== null && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                            <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {book.average_rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-indigo-800 mb-1 line-clamp-1">{book.title}</h3>
                        <p className="text-sm text-indigo-600 mb-2">oleh {book.author}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {book.categories.slice(0, 2).map((category, idx) => (
                            <span key={idx} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                              {category}
                            </span>
                          ))}
                          {book.categories.length > 2 && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                              +{book.categories.length - 2}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${book.available_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {book.available_quantity > 0 ? `${book.available_quantity} tersedia` : 'Tidak tersedia'}
                          </span>
                          <button 
                            onClick={() => router.push(`/books/${book.id}`)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-4 border-t border-indigo-100 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-500">
            &copy; 2025 AutoLib. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Font fix & Animation*/}
      <style jsx global>{`
        html, body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          background: linear-gradient(to bottom right, #dbeafe, #f3e8ff, #e0e7ff);
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}