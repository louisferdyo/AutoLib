'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {createClient} from '../../../../lib/supabase';

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
      const processedData = data.map(tx => ({
        ...tx,
        books:
          Array.isArray(tx.books)
            ? tx.books[0] || { title: '', author: '' }
            : tx.books || { title: '', author: '' },
      }));

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
      
  

      // 3. Active - "Sedang Dipinjam" (status = active && actual_pickup_time is not null)
      // const canceledPickUp = processedData.filter(tx => 
      //   tx.status === 'canceled' 
      // );
      
      // 4. Active Late Pickup - past pickup window
      const activeLate = processedData.filter(tx => {
        if (tx.status !== 'active' || tx.actual_pickup_time !== null) return false;
        
        const pickupTime = new Date(tx.scheduled_pickup_time);
        const pickupDeadline = new Date(pickupTime.getTime() + 2 * 60 * 60 * 1000);
        const currentTime = new Date();
        
        return currentTime > pickupDeadline;
      });
      
      // 5. Late (status = late)
      const late = processedData.filter(tx => tx.status === 'late');
      const canceled = processedData.filter(tx => tx.status === 'canceled');

      setWaitingTransactions(waiting);
      setActivePickupTransactions(activePickup);
      // setWaitingReturnTransactions(waitingReturn);
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
    <li key={tx.id} className={`p-6 shadow rounded-lg border ${
      section === 'late' ? 'bg-red-50 border-red-300' : 
      section === 'activeLate' ? 'bg-yellow-50 border-yellow-300' : 
      'bg-white border-gray-200'
    }`}>
      <h2 className="font-semibold text-xl">{tx.books.title}</h2>
      <p className="text-gray-600 mb-2">Penulis: {tx.books.author}</p>
      <div className="space-y-1 mb-4 text-sm text-gray-600">
        <p><span className="font-medium">Status:</span> {tx.status}</p>
        <p><span className="font-medium">Jadwal Ambil:</span> {formatDate(tx.scheduled_pickup_time)}</p>
        {tx.actual_pickup_time && <p><span className="font-medium">Diambil pada:</span> {formatDate(tx.actual_pickup_time)}</p>}
        <p><span className="font-medium">Jadwal Kembali:</span> {formatDate(tx.scheduled_return_time)}</p>
        {tx.actual_return_time && <p><span className="font-medium">Dikembalikan pada:</span> {formatDate(tx.actual_return_time)}</p>}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {/* Button for Waiting section - now it's for returns not pickups */}
        {section === 'waiting' && (
          <button
            onClick={() => handleConfirmReturn(tx.id)}
            disabled={actionLoading === tx.id || !canReturn(tx)}
            className={`py-2 px-4 rounded text-white ${
              actionLoading === tx.id || !canPickup(tx)
                ? 'bg-gray-400 cursor-not-allowed'
                : "bg-green-600 hover:bg-green-70  text-white py-2 px-4 rounded" 
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
            className={`py-2 px-4 rounded text-white ${
              actionLoading === tx.id || !canPickup(tx)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
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
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            {actionLoading === tx.id ? 'Memproses...' : 'Konfirmasi Pengembalian'}
          </button>
        )}

        {/* Button for Late section */}
        {section === 'late' && tx.actual_pickup_time && !tx.actual_return_time && (
          <button
            onClick={() => handleConfirmReturn(tx.id)}
            disabled={actionLoading === tx.id}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            {actionLoading === tx.id ? 'Memproses...' : 'Konfirmasi Pengembalian'}
          </button>
        )}

        {/* Cancel button for applicable sections */}
        {(section === 'activePickup') && (
          <button
            onClick={() => handleCancelBooking(tx.id, tx.book_id)}
            disabled={actionLoading === tx.id}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            {actionLoading === tx.id ? 'Memproses...' : 'Batalkan Peminjaman'}
          </button>
        )}

        {/* Late pickup message */}
        {section === 'activeLate' && (
          <p className="text-yellow-700 font-semibold w-full">
            Anda terlambat mengambil buku. Silakan hubungi pustakawan untuk informasi lebih lanjut.
          </p>
        )}

        {/* Late return message */}
        {section === 'late' && (
          <p className="text-red-600 font-semibold w-full">
            Buku terlambat dikembalikan. Anda mungkin dikenakan denda. Segera kembalikan buku.
          </p>
        )}
      </div>
    </li>
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Daftar Peminjaman Buku</h1>
      {loading && <p>Memuat data...</p>}

      {error && (
        <p className="mb-4 text-red-600 font-semibold">{error}</p>
      )}

      {message && (
        <p className="mb-4 text-green-600 font-semibold">{message}</p>
      )}

      {/* 1. Waiting Transactions - now for returning books */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Waiting (Menunggu Pengembalian)</h2>
        {waitingTransactions.length === 0 ? (
          <p>Tidak ada peminjaman yang menunggu pengembalian.</p>
        ) : (
          <ul className="space-y-6">
            {waitingTransactions.map(tx => renderTransactionCard(tx, 'waiting'))}
          </ul>
        )}
      </section>

      {/* 2. Active Transactions: Waiting to be picked up */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Active (Menunggu Pengambilan)</h2>
        {activePickupTransactions.length === 0 ? (
          <p>Tidak ada buku yang siap diambil saat ini.</p>
        ) : (
          <ul className="space-y-6">
            {activePickupTransactions.map(tx => renderTransactionCard(tx, 'activePickup'))}
          </ul>
        )}
      </section>

      {/* 3. Active Transactions: Currently borrowed
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Active (Sedang Dipinjam)</h2>
        {waitingReturnTransactions.length === 0 ? (
          <p>Tidak ada buku yang sedang dipinjam.</p>
        ) : (
          <ul className="space-y-6">
            {waitingReturnTransactions.map(tx => renderTransactionCard(tx, 'waitingReturn'))}
          </ul>
        )}
      </section> */}

      {/* 4. Active Transactions: Late for pickup */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-yellow-700">Canceled</h2>
        {canceledTransactions.length === 0 ? (
          <p>Tidak ada transaksi yang dibatalkan.</p>
        ) : (
          <ul className="space-y-6">
            {canceledTransactions.map(tx => renderTransactionCard(tx, 'canceled'))}
          </ul>
        )}
      </section>

      {/* 5. Late Transactions (Terlambat Dikembalikan) */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-red-600">Terlambat Dikembalikan</h2>
        {lateTransactions.length === 0 ? (
          <p>Tidak ada buku yang terlambat dikembalikan.</p>
        ) : (
          <ul className="space-y-6">
            {lateTransactions.map(tx => renderTransactionCard(tx, 'late'))}
          </ul>
        )}
      </section>
    </main>
  );
}