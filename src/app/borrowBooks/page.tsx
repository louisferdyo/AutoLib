'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '../../../lib/supabase';

interface Locker {
  id: string;
  name: string;
}

export default function BorrowBooksPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');

  const [userId, setUserId] = useState<string | null>(null);
  const [scheduledPickup, setScheduledPickup] = useState('');
  const [scheduledReturn, setScheduledReturn] = useState('');

  const [pickupLockers, setPickupLockers] = useState<Locker[]>([]);
  const [returnLockers, setReturnLockers] = useState<Locker[]>([]);

  const [pickupLockerId, setPickupLockerId] = useState('');
  const [returnLockerId, setReturnLockerId] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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

  const handleSubmit = async () => {
    if (!userId || !bookId || !pickupLockerId || !returnLockerId || !scheduledPickup || !scheduledReturn) {
      setMessage('Semua data harus diisi.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setMessage('');
    try {
      // 1. Save the transaction first
      const transactionRes = await fetch('/api/transactions/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          book_id: bookId,
          locker_id: pickupLockerId, // backend hanya simpan 1 locker id (pickup)
          scheduled_pickup_time: new Date(scheduledPickup).toISOString(),
          scheduled_return_time: new Date(scheduledReturn).toISOString(),
        }),
      });
      
      const transactionData = await transactionRes.json();
      if (!transactionRes.ok) throw new Error(transactionData.error || 'Gagal menyimpan transaksi');
      
      const transactionId = transactionData.id; // Assuming the API returns the transaction ID
      
      // 2. Schedule pickup locker
      const pickupScheduleRes = await fetch('/api/locker_schedules/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locker_id: pickupLockerId,
          start_time: new Date(scheduledPickup).toISOString(),
          user_id: userId,
          transaction_id: transactionId,
          type: 'pickup'
        }),
      });
      
      const pickupData = await pickupScheduleRes.json();
      if (!pickupScheduleRes.ok) throw new Error(pickupData.error || 'Gagal menjadwalkan loker pengambilan');
      
      // 3. Schedule return locker
      const returnScheduleRes = await fetch('/api/locker_schedules/route', {
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
      
      // All calls successful
      setStatus('success');
      setMessage('Peminjaman berhasil! Loker telah dijadwalkan.');
    } catch (err: any) {
      setMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Peminjaman Buku</h1>
      <p className="mb-2">ID Buku: {bookId}</p>

      <label className="block mb-1">Waktu Ambil:</label>
      <input
        type="datetime-local"
        value={scheduledPickup}
        onChange={e => setScheduledPickup(e.target.value)}
        className="w-full mb-3 border px-2 py-1"
      />

      <label className="block mb-1">Waktu Kembali:</label>
      <input
        type="datetime-local"
        value={scheduledReturn}
        onChange={e => setScheduledReturn(e.target.value)}
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
              {l.name}
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
              {l.name}
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
