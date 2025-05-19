import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabaseServer';

export async function POST(
  req: Request,
  { params }: { params: { transaction_id: string } }
) {
  try {
    console.log('Transaction ID from params:', params.transaction_id);

    if (!params.transaction_id) {
      return NextResponse.json(
        { error: 'Transaction ID tidak valid' }, 
        { status: 400 }
      );
    }

    const transactionId = params.transaction_id;
    const supabase = createServerSupabaseClient();

    // Ambil data transaksi
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('id, scheduled_return_time, status, book_id')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      console.error('Error fetching transaction:', fetchError);
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' }, 
        { status: 404 }
      );
    }

    console.log('Found transaction:', transaction);

    // Cek status transaksi, hanya bisa konfirmasi jika status 'waiting'
    if (transaction.status !== 'waiting') {
      return NextResponse.json(
        { error: `Transaksi tidak dapat dikonfirmasi karena status: ${transaction.status}` }, 
        { status: 400 }
      );
    }

    const now = new Date();
    const scheduledReturn = new Date(transaction.scheduled_return_time);
    const lateThreshold = new Date(scheduledReturn.getTime() + 2 * 60 * 60 * 1000);
    // Tentukan status baru dan apakah terlambat
    let newStatus = 'finished';
    let isLate = false;
    if (now > lateThreshold) {
      newStatus = 'late';
      isLate = true;
    }

    // Update transaksi: set actual_return_time dan status baru
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        actual_return_time: now.toISOString(),
        status: newStatus,
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return NextResponse.json(
        { error: 'Gagal mengkonfirmasi pengembalian: ' + updateError.message }, 
        { status: 500 }
      );
    }

    // Tambah available_quantity buku satu
    const { data: book, error: getBookError } = await supabase
      .from('books')
      .select('available_quantity')
      .eq('id', transaction.book_id)
      .single();

    if (getBookError) {
      console.error('Error getting book:', getBookError);
      // Lanjutkan tanpa menghentikan proses
    }

    if (book) {
      const { error: updateBookError } = await supabase
        .from('books')
        .update({ available_quantity: book.available_quantity + 1 })
        .eq('id', transaction.book_id);

      if (updateBookError) {
        console.error('Error updating book quantity:', updateBookError);
        // Lanjutkan juga
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Pengembalian buku berhasil dikonfirmasi',
        is_late: isLate,
        new_status: newStatus
      },
      { status: 200 }
    );

  } catch (e: any) {
    console.error('Error confirming return:', e);
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    );
  }
}
