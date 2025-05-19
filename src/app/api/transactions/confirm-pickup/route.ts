// app/api/transactions/[transaction_id]/confirm-pickup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabaseServer';

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID tidak valid' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Ambil data transaksi
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('id, scheduled_pickup_time, status')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      console.error('Error fetching transaction:', fetchError);
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validasi status transaksi
    if (transaction.status === 'waiting' || transaction.status === 'finished') {
      return NextResponse.json(
        { error: `Transaksi tidak dapat dikonfirmasi, status saat ini: ${transaction.status}` },
        { status: 400 }
      );
    }

    // Validasi waktu pengambilan
    const now = new Date();
    const scheduledPickup = new Date(transaction.scheduled_pickup_time);
    const cutoffTime = new Date(scheduledPickup.getTime() + 5 * 60 * 60 * 1000); // +5 jam

    if (now < scheduledPickup) {
      return NextResponse.json(
        { error: 'Belum waktunya untuk pengambilan buku' },
        { status: 400 }
      );
    }

    if (now > cutoffTime) {
      return NextResponse.json(
        { error: 'Batas waktu pengambilan telah berakhir' },
        { status: 400 }
      );
    }

    // Update transaksi: set waktu pengambilan dan status = waiting
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        actual_pickup_time: now.toISOString(),
        status: 'waiting',
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return NextResponse.json(
        { error: 'Gagal mengkonfirmasi pengambilan: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Pengambilan buku berhasil dikonfirmasi' },
      { status: 200 }
    );

  } catch (e: any) {
    console.error('Error confirming pickup:', e);
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    );
  }
}
