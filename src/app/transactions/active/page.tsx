'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../../lib/supabase';

type Transaction = {
  id: string;
  book_id: string;
  status: string;
  scheduled_pickup_time: string;
  scheduled_return_time: string;
  actual_pickup_time: string | null;
  actual_return_time: string | null;
  books: {
    title: string;
    author: string;
  };
};

export default function BorrowedBooksPage() {
  const [waitingTransactions, setWaitingTransactions] = useState<Transaction[]>([]);
  const [activePickupTransactions, setActivePickupTransactions] = useState<Transaction[]>([]);
  const [waitingReturnTransactions, setWaitingReturnTransactions] = useState<Transaction[]>([]);
  const [activeLatePickup, setActiveLatePickup] = useState<Transaction[]>([]);
  const [lateTransactions, setLateTransactions] = useState<Transaction[]>([]);
  const [canceledTransactions, setCanceledTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchTransactions();
    
    // Check for late returns every minute
    const interval = setInterval(() => {
      checkLateReturns();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to check for late returns and update their status
  const checkLateReturns = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) return;

    const now = new Date().toISOString();
    
    // Update status to 'late' for any transactions where:
    // 1. Status is 'active'
    // 2. scheduled_return_time has passed
    // 3. actual_return_time is null (not returned yet)
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'late' })
      .eq('status', 'active')
      .lt('scheduled_return_time', now)
      .is('actual_return_time', null);
      
    if (error) {
      console.error('Error checking late returns:', error);
    } else {
      // Refresh transactions if any were updated
      fetchTransactions();
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      router.push('/login');
      return;
    }

    const userId = session.user.id;
    const now = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, book_id, status, scheduled_pickup_time, scheduled_return_time,
          actual_pickup_time, actual_return_time,
          books:book_id(title, author) 
        `)
        .eq('user_id', userId)
        .in('status', ['waiting', 'active', 'late', 'canceled'])
        .order('scheduled_pickup_time', { ascending: true });

      if (error) throw error;

      // Process data to normalize the books field
      const processedData = data.map((tx: any) => ({
        ...tx,
        books:
          Array.isArray(tx.books)
            ? tx.books[0] || { title: '', author: '' }
            : tx.books || { title: '', author: '' },
      })) as Transaction[];

      // 1. Waiting - "Menunggu Pengembalian" (status = waiting)
      const waiting = processedData.filter(tx => tx.status === 'waiting');
      
      // 2. Active - "Menunggu Pengambilan" - can be picked up within window
      const activePickup = processedData.filter(tx => {
        if (tx.status !== 'active' || tx.actual_pickup_time !== null) return false;
        
        const pickupTime = new Date(tx.scheduled_pickup_time);
        const pickupDeadline = new Date(pickupTime.getTime() + 2 * 60 * 60 * 1000);
        const currentTime = new Date();
        
        return currentTime <= pickupDeadline;
      });
      
      // 3. Active Late Pickup - past pickup window
      const activeLate = processedData.filter(tx => {
        if (tx.status !== 'active' || tx.actual_pickup_time !== null) return false;
        
        const pickupTime = new Date(tx.scheduled_pickup_time);
        const pickupDeadline = new Date(pickupTime.getTime() + 2 * 60 * 60 * 1000);
        const currentTime = new Date();
        
        return currentTime > pickupDeadline;
      });
      
      // 4. Late (status = late)
      const late = processedData.filter(tx => tx.status === 'late');
      const canceled = processedData.filter(tx => tx.status === 'canceled');

      setWaitingTransactions(waiting);
      setActivePickupTransactions(activePickup);
      setActiveLatePickup(activeLate);
      setLateTransactions(late);
      setCanceledTransactions(canceled);

    } catch (err: any) {
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async (transactionId: string) => {
    if (!confirm('Apakah Anda yakin akan mengkonfirmasi pengambilan buku?')) return;

    setActionLoading(transactionId);
    try {
      const res = await fetch(`/api/transactions/confirm-pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengkonfirmasi pengambilan');
      }

      setMessage('Pengambilan buku berhasil dikonfirmasi');
      fetchTransactions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReturn = async (transactionId: string) => {
    if (!confirm('Apakah Anda yakin akan mengkonfirmasi pengembalian buku?')) return;

    setActionLoading(transactionId);
    try {
      const res = await fetch(`/api/transactions/confirm-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengkonfirmasi pengembalian');
      }

      setMessage('Pengembalian buku berhasil dikonfirmasi');
      fetchTransactions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (transactionId: string, bookId: string) => {
    if (!confirm('Apakah Anda yakin akan membatalkan peminjaman buku?')) return;

    setActionLoading(transactionId);
    try {
      const res = await fetch(`/api/transactions/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, bookId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membatalkan peminjaman');
      }

      setMessage('Peminjaman buku berhasil dibatalkan');
      fetchTransactions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const canPickup = (tx: Transaction): boolean => {
    if (tx.status !== 'active' || tx.actual_pickup_time !== null) return false;

    const now = new Date();
    const scheduled = new Date(tx.scheduled_pickup_time);
    const cutoff = new Date(scheduled.getTime() + 2 * 60 * 60 * 1000); // 2 jam

    return now >= scheduled && now <= cutoff;
  };

  const canReturn = (tx: Transaction): boolean => {
    if (tx.status !== 'active' || tx.actual_return_time !== null) return false;

    const now = new Date();
    const scheduled = new Date(tx.scheduled_return_time);
    const cutoff = new Date(scheduled.getTime() + 2 * 60 * 60 * 1000); // 2 jam

    return now >= scheduled && now <= cutoff;
  };

  const isLatePickup = (scheduledTime: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const cutoff = new Date(scheduled.getTime() + 2 * 60 * 60 * 1000); // 2 hours window
    return now > cutoff;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderTransactionCard = (tx: Transaction, section: string) => (
    <li key={tx.id} className={`p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-102 ${
      section === 'late' ? 'bg-red-50/80 backdrop-blur-sm border border-red-200' : 
      section === 'activeLate' ? 'bg-yellow-50/80 backdrop-blur-sm border border-yellow-200' : 
      section === 'canceled' ? 'bg-gray-50/80 backdrop-blur-sm border border-gray-200' : 
      'bg-white/70 backdrop-blur-sm border border-indigo-100'
    }`}>
      <h2 className="font-semibold text-xl text-indigo-700">{tx.books.title}</h2>
      <p className="text-purple-600 mb-3">Penulis: {tx.books.author}</p>
      <div className="space-y-1 mb-4 text-sm">
        <p><span className="font-medium text-indigo-600">Status:</span> 
          <span className={`ml-1 ${
            tx.status === 'late' ? 'text-red-600' : 
            tx.status === 'waiting' ? 'text-green-600' : 
            tx.status === 'active' ? 'text-blue-600' :
            tx.status === 'canceled' ? 'text-gray-600' : 'text-gray-600'
          }`}>
            {tx.status === 'waiting' ? 'Menunggu Pengembalian' : 
             tx.status === 'active' ? 'Aktif' : 
             tx.status === 'late' ? 'Terlambat' : 
             tx.status === 'canceled' ? 'Dibatalkan' : tx.status}
          </span>
        </p>
        <p><span className="font-medium text-indigo-600">Jadwal Ambil:</span> {formatDate(tx.scheduled_pickup_time)}</p>
        {tx.actual_pickup_time && <p><span className="font-medium text-indigo-600">Diambil pada:</span> {formatDate(tx.actual_pickup_time)}</p>}
        <p><span className="font-medium text-indigo-600">Jadwal Kembali:</span> {formatDate(tx.scheduled_return_time)}</p>
        {tx.actual_return_time && <p><span className="font-medium text-indigo-600">Dikembalikan pada:</span> {formatDate(tx.actual_return_time)}</p>}
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {/* Button for Waiting section - now it's for returns not pickups */}
        {section === 'waiting' && (
          <button
            onClick={() => handleConfirmReturn(tx.id)}
            disabled={actionLoading === tx.id || !canReturn(tx)}
            className={`py-2 px-4 rounded-lg text-white transition-colors duration-300 shadow-sm ${
              actionLoading === tx.id || !canPickup(tx)
                ? 'bg-gray-400 cursor-not-allowed'
                : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600" 
            }`}
          >
            {actionLoading === tx.id ? 'Memproses...' : 'Konfirmasi Pengembalian'}
          </button>
        )}

        {/* Button for Active Pickup section */}
        {section === 'activePickup' && (
          <button
            onClick={() => handleConfirmPickup(tx.id)}
            disabled={actionLoading === tx.id || !canPickup(tx)}
            className={`py-2 px-4 rounded-lg text-white shadow-sm transition-colors duration-300 ${
              actionLoading === tx.id || !canPickup(tx)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            }`}
          >
            {actionLoading === tx.id ? 'Memproses...' : 'Konfirmasi Pengambilan'}
          </button>
        )}

        {/* Button for Waiting Return section */}
        {section === 'waitingReturn' && (
          <button
            onClick={() => handleConfirmReturn(tx.id)}
            disabled={actionLoading === tx.id}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-2 px-4 rounded-lg shadow-sm transition-colors duration-300"
          >
            {actionLoading === tx.id ? 'Memproses...' : 'Konfirmasi Pengembalian'}
          </button>
        )}

        {/* Button for Late section */}
        {section === 'late' && tx.actual_pickup_time && !tx.actual_return_time && (
          <button
            onClick={() => handleConfirmReturn(tx.id)}
            disabled={actionLoading === tx.id}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-2 px-4 rounded-lg shadow-sm transition-colors duration-300"
          >
            {actionLoading === tx.id ? 'Memproses...' : 'Konfirmasi Pengembalian'}
          </button>
        )}

        {/* Cancel button for applicable sections */}
        {(section === 'activePickup') && (
          <button
            onClick={() => handleCancelBooking(tx.id, tx.book_id)}
            disabled={actionLoading === tx.id}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-2 px-4 rounded-lg shadow-sm transition-colors duration-300"
          >
            {actionLoading === tx.id ? 'Memproses...' : 'Batalkan Peminjaman'}
          </button>
        )}

        {/* Late pickup message */}
        {section === 'activeLate' && (
          <p className="text-yellow-700 font-semibold w-full bg-yellow-100/50 p-3 rounded-lg">
            Anda terlambat mengambil buku. Silakan hubungi pustakawan untuk informasi lebih lanjut.
          </p>
        )}

        {/* Late return message */}
        {section === 'late' && (
          <p className="text-red-600 font-semibold w-full bg-red-100/50 p-3 rounded-lg">
            Buku terlambat dikembalikan. Anda mungkin dikenakan denda. Segera kembalikan buku.
          </p>
        )}
      </div>
    </li>
  );

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
          </div>
        </div>
      </nav>

      {/* Decorative circles */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10 flex-grow">
        <h1 className="text-2xl font-bold mb-6 text-indigo-700">Daftar Peminjaman Buku</h1>
        
        {loading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-100/80 backdrop-blur-sm border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 px-4 py-3 bg-green-100/80 backdrop-blur-sm border border-green-200 rounded-lg text-green-700">
            {message}
          </div>
        )}

        {/* 1. Waiting Transactions - now for returning books */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-indigo-700 border-b border-indigo-200 pb-2">Menunggu Pengembalian</h2>
          {waitingTransactions.length === 0 ? (
            <p className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm text-indigo-600">Tidak ada peminjaman yang menunggu pengembalian.</p>
          ) : (
            <ul className="space-y-6">
              {waitingTransactions.map(tx => renderTransactionCard(tx, 'waiting'))}
            </ul>
          )}
        </section>

        {/* 2. Active Transactions: Waiting to be picked up */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-indigo-700 border-b border-indigo-200 pb-2">Menunggu Pengambilan</h2>
          {activePickupTransactions.length === 0 ? (
            <p className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm text-indigo-600">Tidak ada buku yang siap diambil saat ini.</p>
          ) : (
            <ul className="space-y-6">
              {activePickupTransactions.map(tx => renderTransactionCard(tx, 'activePickup'))}
            </ul>
          )}
        </section>

        {/* 4. Canceled Transactions */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b border-gray-200 pb-2">Transaksi Dibatalkan</h2>
          {canceledTransactions.length === 0 ? (
            <p className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm text-indigo-600">Tidak ada transaksi yang dibatalkan.</p>
          ) : (
            <ul className="space-y-6">
              {canceledTransactions.map(tx => renderTransactionCard(tx, 'canceled'))}
            </ul>
          )}
        </section>

        {/* 5. Late Transactions (Terlambat Dikembalikan) */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-red-600 border-b border-red-200 pb-2">Terlambat Dikembalikan</h2>
          {lateTransactions.length === 0 ? (
            <p className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm text-indigo-600">Tidak ada buku yang terlambat dikembalikan.</p>
          ) : (
            <ul className="space-y-6">
              {lateTransactions.map(tx => renderTransactionCard(tx, 'late'))}
            </ul>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-4 border-t border-indigo-100 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-500">
            &copy; 2025 AutoLib. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Animation */}
      <style jsx global>{`
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
  );
}