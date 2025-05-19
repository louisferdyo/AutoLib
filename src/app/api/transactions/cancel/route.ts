import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export async function POST(
  req: Request,
  // { params }: { params: { transaction_id: string } }
) {
  try {
    const body = await req.json();
    const { transactionId, bookId} = body;

    // Parse body
    if (!bookId) {
      return NextResponse.json(
        { error: 'Invalid body: sertakan field book_id' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Ambil transaksi
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('status, actual_pickup_time, book_id')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Cek kesesuaian book_id
    if (transaction.book_id !== bookId) {
      return NextResponse.json({ error: 'ID buku tidak sesuai dengan transaksi' }, { status: 400 });
    }

    // Hanya boleh batalkan jika belum di‑pickup dan belum finished
    if (transaction.actual_pickup_time || transaction.status === 'finished') {
      return NextResponse.json(
        { error: 'Tidak dapat membatalkan: sudah diambil atau sudah selesai' },
        { status: 400 }
      );
    }

    // 1) Hapus jadwal loker
    const { error: lockerErr } = await supabase
      .from('locker_schedules')
      .delete()
      .eq('transaction_id', transactionId);

    if (lockerErr) {
      return NextResponse.json(
        { error: 'Gagal menghapus jadwal loker' },
        { status: 500 }
      );
    }

    // 2) Update status transaksi → 'canceled'
    const { error: updateTxnErr } = await supabase
      .from('transactions')
      .update({ status: 'canceled' })
      .eq('id', transactionId);

    if (updateTxnErr) {
      return NextResponse.json(
        { error: 'Gagal mengubah status transaksi' },
        { status: 500 }
      );
    }

    // 3) Increment available_quantity buku
    const { data: book, error: getBookErr } = await supabase
      .from('books')
      .select('available_quantity')
      .eq('id', bookId)
      .single();

    if (!getBookErr && book) {
      const { error: updBookErr } = await supabase
        .from('books')
        .update({ available_quantity: book.available_quantity + 1 })
        .eq('id', bookId);

      if (updBookErr) {
        console.error('Gagal update stok buku:', updBookErr);
      }
    }

    return NextResponse.json(
      { success: true, message: 'Transaksi berhasil dibatalkan' },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('Error canceling booking:', e);
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    );
  }
}
