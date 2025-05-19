// lib/services/lockerService.ts
import  {createClient} from '../supabase';
import { assignLockerAccess, revokeLockerAccess } from '../mqtt';

type Locker = { id: string };
type LockerSchedule = {
  id: string;
  locker_id: string;
  user_id: string;
  transaction_id: string;
  start_time: string;
  end_time: string;
  status: string;
};

/**
 * Cari loker yang tersedia pada rentang waktu tertentu
 */

export async function findAvailableLocker(
  startTime: Date,
  endTime: Date
): Promise<string | null> {
  const supabase = createClient()
  // 1. Ambil semua locker_id yang sedang dipakai di waktu bentrok
  const { data: blocked, error: blockedError } = await supabase
    .from('locker_schedules')
    .select('locker_id')
    .or(
      `start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()}`
    );

  if (blockedError) {
    console.error('Error fetching blocked lockers:', blockedError);
    throw blockedError;
  }

  const blockedIds = (blocked ?? []).map(item => item.locker_id);

  // 2. Ambil semua locker_id yang tidak termasuk blocked
  const { data: allUsed, error: allError } = await supabase
    .from('locker_schedules')
    .select('locker_id');

  if (allError) {
    console.error('Error fetching all used lockers:', allError);
    throw allError;
  }

  // Semua locker yang pernah digunakan
  const allLockerIds = Array.from(new Set((allUsed ?? []).map(item => item.locker_id)));

  // Filter yang tidak terblokir
  const available = allLockerIds.filter(id => !blockedIds.includes(id));

  return available.length > 0 ? available[0] : null;
}

/**
 * Jadwalkan loker untuk transaksi
 */
export async function scheduleLocker(
  lockerId: string,
  userId: string,
  transactionId: string,
  startTime: Date,
  endTime: Date
): Promise<LockerSchedule> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('locker_schedules')
    .insert({
      locker_id: lockerId,
      user_id: userId,
      transaction_id: transactionId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'scheduled'
    })
    .select()
    .single();

  if (error) {
    console.error('Error scheduling locker:', error);
    throw error;
  }

  assignLockerAccess(lockerId, userId, transactionId, startTime, endTime);
  return data;
}

/**
 * Batalkan jadwal loker
 */
export async function cancelLockerSchedule(
  scheduleId: string
): Promise<boolean> {
  const supabase = createClient()
  const { data: scheduleData, error: fetchError } = await supabase
    .from('locker_schedules')
    .select('locker_id, user_id, transaction_id')
    .eq('id', scheduleId)
    .single();

  if (fetchError) {
    console.error('Error fetching locker schedule:', fetchError);
    throw fetchError;
  }

  const { error: updateError } = await supabase
    .from('locker_schedules')
    .update({ status: 'cancelled' })
    .eq('id', scheduleId);

  if (updateError) {
    console.error('Error cancelling locker schedule:', updateError);
    throw updateError;
  }

  revokeLockerAccess(
    scheduleData.locker_id,
    scheduleData.user_id,
    scheduleData.transaction_id
  );
  return true;
}

/**
 * Ambil jadwal loker aktif untuk user
 */
export async function getUserActiveLockerSchedules(
  userId: string
) {
  const supabase = createClient()
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('locker_schedules')
    .select(
      `id, locker_id, start_time, end_time, transaction_id, status, 
       lockers(id, name, location), transactions(id, book_id, transaction_type, status)`
    )
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .lt('start_time', now)
    .gt('end_time', now);

  if (error) {
    console.error('Error getting user locker schedules:', error);
    throw error;
  }

  return data || [];
}