'use client'

import { useEffect, useState } from 'react'
import {createClient} from '../../../../lib/supabase';

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
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch(`/api/transactions/history?user_id=${user.id}`)
      const json = await res.json()

      if (json.data) {
        setTransactions(json.data)
      }

      setLoading(false)
    }

    fetchHistory()
  }, [supabase])

  if (loading) return <p>Memuat riwayat transaksi...</p>

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi Anda</h1>

      {transactions.length === 0 ? (
        <p>Tidak ada transaksi selesai atau dibatalkan.</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map(tx => (
            <li key={tx.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">
                    {tx.books?.title || 'Judul tidak tersedia'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tx.books?.author || '-'}
                  </p>
                  <p className="mt-2 text-sm">
                    Locker: <span className="font-medium">{tx.lockers?.code || '-'}</span>
                  </p>
                  <p className="text-sm">
                    Waktu Ambil: {new Date(tx.scheduled_pickup_time).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm">
                    Waktu Kembali: {new Date(tx.scheduled_return_time).toLocaleString('id-ID')}
                  </p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium mt-1 ${
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
