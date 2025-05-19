// lib/services/transactionService.ts
import {createClient} from '../supabase';
import { updateBookAvailability, checkBookAvailability } from './bookService';
import { findAvailableLocker, scheduleLocker } from './lockerService';

interface Transaction {
  id: string;
  user_id: string;
  book_id: string;
  locker_id: string;
  transaction_type: string;
  status: string;
  scheduled_pickup_time: string;
  actual_pickup_time?: string | null;
  scheduled_return_time: string;
  actual_return_time?: string | null;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover_image: string;
}

interface Locker {
  id: string;
  name: string;
  location: string;
}

// Karena Supabase mengembalikan array untuk relasi, definisikan sebagai array dulu
interface TransactionWithRelations extends Transaction {
  books: Book[];     // array karena relasi supabase
  lockers: Locker[]; // array karena relasi supabase
}

interface TransactionWithSingleRelations extends Transaction {
  books: Book | null;     // setelah map ambil elemen pertama
  lockers: Locker | null;
}

interface CreateBorrowTransactionResult {
  success: boolean;
  transaction: Transaction;
  locker: Locker;
}

interface ProcessReturnResult {
  success: boolean;
  transactionId: string;
  lockerId: string;
}

interface ConfirmPickupResult {
  success: boolean;
  transaction: Transaction;
}

export async function createBorrowTransaction(
  userId: string,
  bookId: string,
  pickupTime: string,
  returnTime: string
): Promise<CreateBorrowTransactionResult> {
  try {
    const supabase = createClient()
    const { isAvailable } = await checkBookAvailability(bookId);
    if (!isAvailable) {
      throw new Error('Book is not available for borrowing');
    }

    const pickupTimeDate = new Date(pickupTime);
    const pickupEndTime = new Date(pickupTimeDate);
    pickupEndTime.setHours(pickupEndTime.getHours() + 1);

    // Kalau findAvailableLocker cuma return locker ID string
    const lockerId = await findAvailableLocker(pickupTimeDate, pickupEndTime);
    if (!lockerId) {
      throw new Error('No lockers available for the requested pickup time');
    }

    // Dapatkan data locker lengkap dari ID
    const { data: availableLocker, error: lockerError } = await supabase
      .from('lockers')
      .select('*')
      .eq('id', lockerId)
      .single();

    if (lockerError || !availableLocker) {
      throw lockerError ?? new Error('Locker not found');
    }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        book_id: bookId,
        locker_id: availableLocker.id,
        transaction_type: 'borrow',
        status: 'scheduled',
        scheduled_pickup_time: pickupTime,
        scheduled_return_time: returnTime,
      })
      .select()
      .single();

    if (txError || !transaction) {
      console.error('Error creating transaction:', txError);
      throw txError ?? new Error('Failed to create transaction');
    }

    await updateBookAvailability(bookId, -1);

    await scheduleLocker(
      availableLocker.id,
      userId,
      transaction.id,
      pickupTimeDate,
      pickupEndTime
    );

    return {
      success: true,
      transaction,
      locker: availableLocker,
    };
  } catch (error) {
    console.error('Error in createBorrowTransaction:', error);
    throw error;
  }
}


export async function processBookReturn(
  transactionId: string,
  userId: string
): Promise<ProcessReturnResult> {
  try {
    const supabase = createClient()
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, book_id, status, locker_id')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .single();

    if (txError || !transaction) {
      console.error('Error fetching transaction:', txError);
      throw new Error('Transaction not found or access denied');
    }

    if (transaction.status !== 'borrowed') {
      throw new Error(`Cannot return transaction with status ${transaction.status}`);
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'returned',
        actual_return_time: now,
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      throw updateError;
    }

    await updateBookAvailability(transaction.book_id, 1);

    const returnTimeDate = new Date();
    const returnEndTime = new Date(returnTimeDate);
    returnEndTime.setHours(returnEndTime.getHours() + 1);

    const lockerId = transaction.locker_id;

    await scheduleLocker(lockerId, userId, transactionId, returnTimeDate, returnEndTime);

    return {
      success: true,
      transactionId,
      lockerId,
    };
  } catch (error) {
    console.error('Error in processBookReturn:', error);
    throw error;
  }
}

export async function confirmBookPickup(
  transactionId: string
): Promise<ConfirmPickupResult> {
  try {
    const supabase = createClient()
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: 'borrowed',
        actual_pickup_time: now,
      })
      .eq('id', transactionId)
      .eq('status', 'scheduled')
      .select()
      .single();

    if (error || !data) {
      console.error('Error confirming book pickup:', error);
      throw error ?? new Error('Failed to confirm book pickup');
    }

    return { success: true, transaction: data };
  } catch (error) {
    console.error('Error in confirmBookPickup:', error);
    throw error;
  }
}

export async function getUserActiveTransactions(
  userId: string
): Promise<TransactionWithSingleRelations[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        user_id,
        book_id,
        locker_id,
        transaction_type,
        status,
        scheduled_pickup_time,
        actual_pickup_time,
        scheduled_return_time,
        actual_return_time,
        books(id, title, author, cover_image),
        lockers(id, name, location)
      `)
      .eq('user_id', userId)
      .in('status', ['scheduled', 'borrowed'])
      .order('scheduled_pickup_time', { ascending: false });

    if (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }

    // Supabase mengembalikan array relasi, ambil elemen pertama saja
    return (data ?? []).map(tx => ({
      ...tx,
      books: tx.books?.[0] ?? null,
      lockers: tx.lockers?.[0] ?? null,
    }));
  } catch (error) {
    console.error('Error in getUserActiveTransactions:', error);
    throw error;
  }
}

interface UserTransactionHistoryResult {
  transactions: TransactionWithSingleRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getUserTransactionHistory(
  userId: string,
  limit = 10,
  page = 1
): Promise<UserTransactionHistoryResult> {
  try {
    const supabase = createClient()
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('transactions')
      .select(
        `
        id,
        user_id,
        book_id,
        locker_id,
        transaction_type,
        status,
        scheduled_pickup_time,
        actual_pickup_time,
        scheduled_return_time,
        actual_return_time,
        books(id, title, author, cover_image),
        lockers(id, name, location)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('scheduled_pickup_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting user transaction history:', error);
      throw error;
    }

    return {
      transactions: (data ?? []).map(tx => ({
        ...tx,
        books: tx.books?.[0] ?? null,
        lockers: tx.lockers?.[0] ?? null,
      })),
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  } catch (error) {
    console.error('Error in getUserTransactionHistory:', error);
    throw error;
  }
}
