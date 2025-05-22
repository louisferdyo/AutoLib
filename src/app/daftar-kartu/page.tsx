'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  full_name: string;
  email: string;
  card_id: string | null;
}

interface RegistrationStatus {
  status: 'idle' | 'loading' | 'waiting' | 'success' | 'error';
  message: string;
  user?: UserData;
}

export default function RegisterCardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>({
    status: 'idle',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        router.push('/login');
        return;
      }

      if (!session) {
        router.push('/login');
        return;
      }

      // Jika session valid, fetch user profile
      fetchUserProfile(session.user.id);
    };

    checkSession();
  }, [router]);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);

    try {
      // 

      // Ganti .single() dengan .maybeSingle() agar tidak error jika data kosong
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, card_id')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setRegistrationStatus({
          status: 'error',
          message: 'User tidak ditemukan. Silakan hubungi administrator.'
        });
        setUser(null);
      } else {
        setUser(data);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message || error);
      setRegistrationStatus({
        status: 'error',
        message: 'Gagal memuat profil pengguna'
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCard = async () => {
    console.log('User object before register:', user);
    if (!user) {
      setRegistrationStatus({ status: 'error', message: 'Data pengguna tidak tersedia' });
      return;
    }

    if (!user.id) {
      setRegistrationStatus({ status: 'error', message: 'ID pengguna tidak valid' });
      return;
    }

    if (user.card_id) {
      setRegistrationStatus({
        status: 'error',
        message: 'Anda sudah memiliki kartu terdaftar. Silakan hubungi administrator untuk mengubahnya.'
      });
      return;
    }

    setRegistrationStatus({
      status: 'loading',
      message: 'Mengirim permintaan ke ESP32...'
    });

    try {
      // Ganti dengan IP ESP32 yang sebenarnya
      const ESP32_IP = '192.168.84.238'; // Sesuaikan dengan IP ESP32 Anda
      const response = await fetch(`http://${ESP32_IP}/registerCard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Permintaan registrasi gagal');
      }

      setRegistrationStatus({
        status: 'waiting',
        message: `Permintaan berhasil dikirim! ${data.message || 'Silakan tempatkan kartu pada pembaca'}`
      });

      // Poll for registration completion
      pollRegistrationStatus();

    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Registrasi gagal'
      });
    }
  };

  const pollRegistrationStatus = () => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        // Refresh user data to check if card_id was updated
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, full_name, email, card_id')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && userData && userData.card_id) {
          clearInterval(interval);
          setRegistrationStatus({
            status: 'success',
            message: `Kartu berhasil terdaftar untuk ${userData.full_name}!`,
            user: userData
          });
          
          // Update current user data
          setUser(userData);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 30 seconds (timeout)
    setTimeout(() => {
      clearInterval(interval);
      if (registrationStatus.status === 'waiting') {
        setRegistrationStatus({
          status: 'error',
          message: 'Waktu registrasi habis. Silakan coba lagi.'
        });
      }
    }, 30000);
  };

  const resetRegistration = () => {
    setRegistrationStatus({
      status: 'idle',
      message: ''
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Show loading while checking authentication and fetching user data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show error if user data not found
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pengguna Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-6">
              Profil pengguna Anda tidak ditemukan dalam sistem. Silakan hubungi administrator.
            </p>
            <button
              onClick={handleSignOut}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header with user info and sign out */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registrasi Kartu RFID</h1>
              <p className="text-gray-600">Selamat datang, {user.full_name}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Keluar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Informasi Anda</h2>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <strong>Nama:</strong> {user.full_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status Kartu:</strong> 
                {user.card_id ? (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Terdaftar ({user.card_id})
                  </span>
                ) : (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Belum Terdaftar
                  </span>
                )}
              </p>
            </div>
          </div>

          {registrationStatus.status === 'idle' && (
            <div className="space-y-4">
              {user.card_id ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-800">
                    Anda sudah memiliki kartu RFID terdaftar. Jika perlu mengubahnya, silakan hubungi administrator.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Klik tombol di bawah untuk memulai proses registrasi kartu RFID. Anda akan diminta untuk menempatkan kartu pada pembaca.
                  </p>
                  <button
                    onClick={handleRegisterCard}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Daftarkan Kartu RFID Saya
                  </button>
                </>
              )}
            </div>
          )}

          {registrationStatus.status === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{registrationStatus.message}</p>
            </div>
          )}

          {registrationStatus.status === 'waiting' && (
            <div className="text-center py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <div className="flex items-center justify-center">
                  <div className="animate-pulse h-4 w-4 bg-yellow-400 rounded-full mr-3"></div>
                  <p className="text-yellow-800 font-medium">Menunggu kartu RFID...</p>
                </div>
                <p className="text-yellow-600 text-sm mt-2">
                  Silakan tempatkan kartu RFID Anda pada pembaca sekarang.
                </p>
              </div>
              <p className="text-gray-600">{registrationStatus.message}</p>
            </div>
          )}

          {registrationStatus.status === 'success' && (
            <div className="text-center py-8">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <div className="flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 font-medium">Registrasi Berhasil!</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{registrationStatus.message}</p>
              {registrationStatus.user && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>ID Kartu Anda:</strong> {registrationStatus.user.card_id}
                  </p>
                </div>
              )}
              <p className="text-green-600 font-medium">
                Sekarang Anda dapat menggunakan kartu RFID untuk mengakses loker!
              </p>
            </div>
          )}

          {registrationStatus.status === 'error' && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-red-800 font-medium">Registrasi Gagal</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{registrationStatus.message}</p>
              {!user.card_id && (
                <button
                  onClick={resetRegistration}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}