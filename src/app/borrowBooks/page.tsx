'use client';

import { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
import {createClient} from '../../../lib/supabase';
import { useBorrowStore } from '../../stores/useBorrowState';
interface Locker {
  id: string;
  locker_name: string;
}

export default function BorrowBooksPage() {
  const bookId = useBorrowStore((state) => state.bookId);

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
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Peminjaman Buku</h1>
      <p className="mb-2">ID Buku: {bookId}</p>

      <label className="block mb-1">Waktu Ambil:</label>
      <input
        type="datetime-local"
        // min={pickupMin}    
        step="3600"
        value={scheduledPickup}
        onChange={e => {
          const date = new Date(e.target.value);
          date.setMinutes(0, 0, 0); // pastikan menit 0
          setScheduledPickup(toLocalISOString(date));
        }}
        className="w-full mb-3 border px-2 py-1"
      />

      <label className="block mb-1">Waktu Kembali:</label>
      <input
        type="datetime-local"
        step="3600"
        min={returnMin}                  // ← tambahkan ini
        value={scheduledReturn}
        onChange={e => {
          const date = new Date(e.target.value);
          date.setMinutes(0, 0, 0);
          setScheduledReturn(toLocalISOString(date));
        }}
        className="w-full mb-3 border px-2 py-1"
      />


      <div className="mb-3">
        <label className="block mb-1">Pilih Loker Ambil:</label>
        <select
          value={pickupLockerId}
          onChange={e => setPickupLockerId(e.target.value)}
          className="w-full border px-2 py-1 mb-2"
        >
          <option value="">-- Pilih Loker --</option>
          {pickupLockers.map(l => (
            <option key={l.id} value={l.id}>
              {l.locker_name}
            </option>
          ))}
        </select>
        {pickupLockers.length === 0 && scheduledPickup && (
          <p className="text-sm text-gray-600">Tidak ada loker untuk waktu ambil.</p>
        )}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Pilih Loker Kembali:</label>
        <select
          value={returnLockerId}
          onChange={e => setReturnLockerId(e.target.value)}
          className="w-full border px-2 py-1 mb-2"
        >
          <option value="">-- Pilih Loker --</option>
          {returnLockers.map(l => (
            <option key={l.id} value={l.id}>
              {l.locker_name}
            </option>
          ))}
        </select>
        {returnLockers.length === 0 && scheduledReturn && (
          <p className="text-sm text-gray-600">Tidak ada loker untuk waktu kembali.</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={status === 'submitting'}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {status === 'submitting' ? 'Memproses...' : 'Kirim'}
      </button>

      {message && (
        <p className={`mt-2 ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}