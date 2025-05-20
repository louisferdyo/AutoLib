'use client';

import { useState, useEffect } from 'react';
import {createClient} from '../../../lib/supabase';
import { useBorrowStore } from '../../stores/useBorrowState';
import Link from 'next/link';

interface Locker {
  id: string;
  locker_name: string;
}

export default function BorrowBooksPage() {
  const bookId = useBorrowStore((state: any) => state.bookId);

  const [userId, setUserId] = useState<string | null>(null);
  const [scheduledPickup, setScheduledPickup] = useState('');
  const [scheduledReturn, setScheduledReturn] = useState('');

  const [pickupLockers, setPickupLockers] = useState<Locker[]>([]);
  const [returnLockers, setReturnLockers] = useState<Locker[]>([]);

  const [pickupLockerId, setPickupLockerId] = useState('');
  const [returnLockerId, setReturnLockerId] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const supabase = createClient();
  // Ambil user session
  useEffect(() => {
    async function fetchSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setMessage('Anda harus login.');
        setStatus('error');
        return;
      }
      setUserId(session.user.id);
    }
    fetchSession();
  }, []);

  // Set default return 2 minggu setelah pickup
  useEffect(() => {
    if (!scheduledPickup) return;
    const pick = new Date(scheduledPickup);
    const ret = new Date(pick.getTime() + 14 * 24 * 60 * 60 * 1000);
    setScheduledReturn(ret.toISOString().slice(0, 16));
  }, [scheduledPickup]);

  // Fetch pickup lockers (GET API dengan query param time)
  useEffect(() => {
    if (!scheduledPickup) return;
    async function fetchPickupLockers() {
      setStatus('loading');
      setMessage('');
      try {
        const timeParam = encodeURIComponent(new Date(scheduledPickup).toISOString());
        const res = await fetch(`/api/lockers/available?time=${timeParam}`);
        const json = await res.json();
        if (res.ok) {
          setPickupLockers(json.lockers || []);
          // Reset pilihan loker jika perubahan waktu
          setPickupLockerId('');
        } else {
          throw new Error(json.error || 'Gagal mengambil data loker pickup');
        }
      } catch (err: any) {
        setMessage(err.message);
        setStatus('error');
      } finally {
        setStatus('idle');
      }
    }
    fetchPickupLockers();
  }, [scheduledPickup]);

  useEffect(() => {
    if (!bookId) return;
    const validBookId = bookId as string;
    async function fetchQuantity() {
      try {
        const res = await fetch(`/api/books/quantity?id=${encodeURIComponent(validBookId)}`);
        const json = await res.json();
        if (res.ok) {
          setAvailableQuantity(json.available_quantity);
        } else {
          setAvailableQuantity(null);
          setMessage(json.error || 'Gagal mengambil data stok buku');
          setStatus('error');
        }
      } catch {
        setAvailableQuantity(null);
        setMessage('Gagal mengambil data stok buku');
        setStatus('error');
      }
    }

    fetchQuantity();
  }, [bookId]);

  // Fetch return lockers (GET API dengan query param time)
  useEffect(() => {
    if (!scheduledReturn) return;
    async function fetchReturnLockers() {
      setStatus('loading');
      setMessage('');
      try {
        const timeParam = encodeURIComponent(new Date(scheduledReturn).toISOString());
        const res = await fetch(`/api/lockers/available?time=${timeParam}`);
        const json = await res.json();
        if (res.ok) {
          setReturnLockers(json.lockers || []);
          // Reset pilihan loker jika perubahan waktu
          setReturnLockerId('');
        } else {
          throw new Error(json.error || 'Gagal mengambil data loker return');
        }
      } catch (err: any) {
        setMessage(err.message);
        setStatus('error');
      } finally {
        setStatus('idle');
      }
    }
    fetchReturnLockers();
  }, [scheduledReturn]);

  const returnMin = scheduledPickup
        ? new Date(new Date(scheduledPickup).getTime() + 3 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 16)
        : '';

  function toLocalISOString(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  const handleSubmit = async () => {
    
    if (!userId || !bookId || !pickupLockerId || !returnLockerId || !scheduledPickup || !scheduledReturn) {
      setMessage('Semua data harus diisi.');
      setStatus('error');
      return;
    }
    if (new Date(scheduledPickup) < new Date()) {
      setMessage('Waktu ambil tidak boleh di masa lalu.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setMessage('');
    try {
      // 1. Konfirmasi ketersediaan loker pickup dan return secara langsung dari list yang sudah diambil
      const pickupLocker = pickupLockers.find(locker => locker.id === pickupLockerId);
      const returnLocker = returnLockers.find(locker => locker.id === returnLockerId);
      
      if (!pickupLocker) {
        throw new Error('Loker pengambilan tidak tersedia pada waktu yang dipilih');
      }
      
      if (!returnLocker) {
        throw new Error('Loker pengembalian tidak tersedia pada waktu yang dipilih');
      }
      
      // 2. Save the transaction now that we're sure lockers are available
      const transactionRes = await fetch('/api/transactions/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          locker_id: pickupLockerId,
          scheduled_pickup_time: new Date(scheduledPickup).toISOString(),
          scheduled_return_time: new Date(scheduledReturn).toISOString(),
        }),
        credentials: 'include'
      });
      
      const transactionData = await transactionRes.json();
      if (!transactionRes.ok) throw new Error(transactionData.error || 'Gagal menyimpan transaksi');
      
      const transactionId = transactionData.data.id;
      console.log('pickupLockerId:', pickupLockerId);
      console.log('userId:', userId);
      console.log('transactionId:', transactionId);
      console.log('scheduledPickup:', scheduledPickup);

      // 3. Schedule pickup locker
      const pickupScheduleRes = await fetch('/api/locker_schedules/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locker_id: pickupLockerId,
          start_time: new Date(scheduledPickup).toISOString(),
          user_id: userId,
          transaction_id: transactionId,
        }),
      });
      
      const pickupData = await pickupScheduleRes.json();
      if (!pickupScheduleRes.ok) throw new Error(pickupData.error || 'Gagal menjadwalkan loker pengambilan');
      
      // 4. Schedule return loker
      const returnScheduleRes = await fetch('/api/locker_schedules/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locker_id: returnLockerId,
          start_time: new Date(scheduledReturn).toISOString(),
          user_id: userId,
          transaction_id: transactionId,
          type: 'return'
        }),
      });
      
      const returnData = await returnScheduleRes.json();
      if (!returnScheduleRes.ok) throw new Error(returnData.error || 'Gagal menjadwalkan loker pengembalian');
      
      // 5. Update book quantity (decrease by 1) - only after transaction is confirmed
      const updateQuantityRes = await fetch('/api/books/update-quantity/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          change: -1 // Decrease available_quantity by 1
        }),
      });
      
      const updateQuantityData = await updateQuantityRes.json();
      if (!updateQuantityRes.ok) throw new Error(updateQuantityData.error || 'Gagal memperbarui stok buku');

      // All calls successful
      setStatus('success');
      setMessage('Peminjaman berhasil! Loker telah dijadwalkan dan stok buku diperbarui.');
    } catch (err: any) {
      setMessage(err.message);
      setStatus('error');
    } finally {
      setStatus(prev => prev === 'submitting' ? 'idle' : prev);
    }
  };
  
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
      <div className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-indigo-100">
            <h1 className="text-2xl font-bold mb-4 text-indigo-700 text-center">Peminjaman Buku</h1>
            <p className="mb-4 text-indigo-600 bg-indigo-50 p-3 rounded-lg text-center font-medium">
              ID Buku: <span className="text-purple-600 font-semibold">{bookId}</span>
            </p>

            <div className="space-y-6">
              <div className="group">
                <label className="block mb-1 text-indigo-600 font-medium">Waktu Ambil:</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="datetime-local"
                    step="3600"
                    value={scheduledPickup}
                    onChange={e => {
                      const date = new Date(e.target.value);
                      date.setMinutes(0, 0, 0); // pastikan menit 0
                      setScheduledPickup(toLocalISOString(date));
                    }}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-indigo-200 rounded-lg shadow-sm placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block mb-1 text-indigo-600 font-medium">Waktu Kembali:</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="datetime-local"
                    step="3600"
                    min={returnMin}
                    value={scheduledReturn}
                    onChange={e => {
                      const date = new Date(e.target.value);
                      date.setMinutes(0, 0, 0);
                      setScheduledReturn(toLocalISOString(date));
                    }}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-indigo-200 rounded-lg shadow-sm placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block mb-1 text-indigo-600 font-medium">Pilih Loker Ambil:</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <select
                    value={pickupLockerId}
                    onChange={e => setPickupLockerId(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-indigo-200 rounded-lg shadow-sm placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">-- Pilih Loker --</option>
                    {pickupLockers.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.locker_name}
                      </option>
                    ))}
                  </select>
                </div>
                {pickupLockers.length === 0 && scheduledPickup && (
                  <p className="text-sm text-purple-600 mt-1">Tidak ada loker untuk waktu ambil.</p>
                )}
              </div>

              <div className="group">
                <label className="block mb-1 text-indigo-600 font-medium">Pilih Loker Kembali:</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <select
                    value={returnLockerId}
                    onChange={e => setReturnLockerId(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-indigo-200 rounded-lg shadow-sm placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">-- Pilih Loker --</option>
                    {returnLockers.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.locker_name}
                      </option>
                    ))}
                  </select>
                </div>
                {returnLockers.length === 0 && scheduledReturn && (
                  <p className="text-sm text-purple-600 mt-1">Tidak ada loker untuk waktu kembali.</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
              >
                {status === 'submitting' ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </div>
                ) : 'Kirim'}
              </button>

              {message && (
                <div className={`p-4 rounded-lg ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} animate-fadeIn`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-4 border-t border-indigo-100 relative z-10">
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
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}