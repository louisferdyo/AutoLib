'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {createClient} from '../../../../lib/supabase';
import BookRating from '../../../component/BookRating';

type Book = {
  title: string
  author: string
}

type Locker = {
  code: string
}

type Transaction = {
  id: number
  scheduled_pickup_time: string
  scheduled_return_time: string
  status: 'finished' | 'canceled'
  status_label: string
  books: Book | null
  lockers: Locker | null
  book_id: string
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch(`/api/transactions/history?user_id=${user.id}`)
        const json = await res.json()

        if (json.data) {
          setTransactions(json.data)
        }
      } catch (error) {
        console.error('Error fetching transaction history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 font-sans">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-purple-600 hover:text-purple-800 transition duration-300">
                  <span className="text-indigo-600">Auto</span>Lib
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-indigo-600 hover:text-indigo-800 transition duration-300 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-indigo-600 hover:text-indigo-800 transition duration-300 text-sm font-medium"
              >
                Profil
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="absolute top-40 left-20 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm py-6 px-6 rounded-2xl shadow-xl border border-indigo-100 mb-6">
            <h1 className="text-2xl font-bold text-indigo-800 mb-2 flex items-center">
              <svg className="h-6 w-6 mr-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Riwayat Transaksi
            </h1>
            <p className="text-indigo-600">Daftar transaksi yang telah selesai atau dibatalkan</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md border border-indigo-100 text-center">
              <svg className="mx-auto h-12 w-12 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-indigo-700 font-medium">Tidak ada transaksi selesai atau dibatalkan.</p>
              <p className="text-indigo-500 mt-2">Transaksi yang sudah selesai atau dibatalkan akan muncul di sini.</p>
              <Link href="/books">
                <button className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition duration-300 transform hover:scale-105">
                  Jelajahi Buku
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map(tx => (
                <div 
                  key={tx.id} 
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-indigo-800">
                          {tx.books?.title || 'Judul tidak tersedia'}
                        </h3>
                        <p className="text-sm text-indigo-600">
                          {tx.books?.author || '-'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'finished'
                          ? 'bg-green-100 text-green-700'
                          : tx.status === 'canceled'
                          ? 'bg-red-100 text-red-700'
                          : tx.status === 'late'
                          ? 'bg-yellow-100 text-yellow-700'
                          : ''
                        }`}
                      >
                        {tx.status_label}
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-indigo-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span className="text-sm text-indigo-700">
                          Locker: <span className="font-medium">{tx.lockers?.code || '-'}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-indigo-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-indigo-700">
                          Ambil: {new Date(tx.scheduled_pickup_time).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center md:col-start-2">
                        <svg className="h-5 w-5 text-indigo-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-indigo-700">
                          Kembali: {new Date(tx.scheduled_return_time).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {tx.status === 'finished' && (
                      <div className="mt-4 pt-4 border-t border-indigo-100">
                        <h4 className="text-sm font-medium text-indigo-700 mb-2">Beri Penilaian Buku</h4>
                        <BookRating 
                          bookId={tx.book_id}
                          className="justify-start"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <Link href="/dashboard">
              <button className="flex items-center px-4 py-2 border border-indigo-300 text-indigo-700 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-indigo-50 transition duration-300">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-white/80 backdrop-blur-sm py-4 border-t border-indigo-100 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-500">
            &copy; 2025 AutoLib. All rights reserved.
          </p>
        </div>
      </footer>

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
      `}</style>
    </div>
  )
}