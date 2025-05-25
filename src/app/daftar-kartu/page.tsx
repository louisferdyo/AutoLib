'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

      fetchUserProfile(session.user.id);
    };

    checkSession();
  }, [router]);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);

    try {
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
      const response = await fetch('https://c0c6-202-146-244-170.ngrok-free.app/registerCard', {
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
          
          setUser(userData);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 2000);

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 font-sans">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-indigo-600">Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 font-sans">
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-100">
              <h1 className="text-2xl font-bold text-indigo-800 mb-4">Pengguna Tidak Ditemukan</h1>
              <p className="text-indigo-600 mb-6">
                Profil pengguna Anda tidak ditemukan dalam sistem. Silakan hubungi administrator.
              </p>
              <button
                onClick={handleSignOut}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 font-sans">
      {/* Header/Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-purple-600 hover:text-purple-800 transition duration-300">
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
      <div className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-indigo-800">Registrasi Kartu RFID</h1>
                <p className="text-indigo-600">Selamat datang, {user.full_name}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-300"
              >
                Keluar
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
            <div className="bg-indigo-50/50 backdrop-blur-sm p-4 rounded-xl mb-6">
              <h2 className="text-lg font-semibold text-indigo-800 mb-2">Informasi Pengguna</h2>
              <div className="space-y-2">
                <p className="text-indigo-600">
                  <span className="font-medium">Nama:</span> {user.full_name}
                </p>
                <p className="text-indigo-600">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-indigo-600">
                  <span className="font-medium">Status Kartu:</span> 
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
                  <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-800">
                      Anda sudah memiliki kartu RFID terdaftar. Jika perlu mengubahnya, silakan hubungi administrator.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-indigo-600">
                      Klik tombol di bawah untuk memulai proses registrasi kartu RFID. Anda akan diminta untuk menempatkan kartu pada pembaca.
                    </p>
                    <button
                      onClick={handleRegisterCard}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      Daftarkan Kartu RFID
                    </button>
                  </>
                )}
              </div>
            )}

            {registrationStatus.status === 'loading' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-indigo-600">{registrationStatus.message}</p>
              </div>
            )}

            {registrationStatus.status === 'waiting' && (
              <div className="text-center py-8">
                <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-pulse h-4 w-4 bg-yellow-400 rounded-full mr-3"></div>
                    <p className="text-yellow-800 font-medium">Menunggu kartu RFID...</p>
                  </div>
                  <p className="text-yellow-700 text-sm mt-2">
                    Silakan tempatkan kartu RFID Anda pada pembaca sekarang.
                  </p>
                </div>
                <p className="text-indigo-600">{registrationStatus.message}</p>
              </div>
            )}

            {registrationStatus.status === 'success' && (
              <div className="text-center py-8">
                <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-center">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <div className="h-6 w-6 text-green-600">✓</div>
                    </div>
                  </div>
                  <p className="text-green-800 font-medium text-lg">Registrasi Berhasil!</p>
                </div>
                <p className="text-indigo-600 mb-4">{registrationStatus.message}</p>
                {registrationStatus.user && (
                  <div className="bg-indigo-50/50 backdrop-blur-sm p-4 rounded-xl mb-4">
                    <p className="text-indigo-700">
                      <span className="font-medium">ID Kartu Anda:</span> {registrationStatus.user.card_id}
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
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-center">
                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <div className="h-6 w-6 text-red-600">×</div>
                    </div>
                  </div>
                  <p className="text-red-800 font-medium text-lg">Registrasi Gagal</p>
                </div>
                <p className="text-indigo-600 mb-6">{registrationStatus.message}</p>
                {!user.card_id && (
                  <button
                    onClick={resetRegistration}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Coba Lagi
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/dashboard">
              <button className="bg-white/80 backdrop-blur-sm text-indigo-600 py-2 px-6 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all duration-300 font-medium flex items-center">
                <span className="mr-2">←</span>
                Kembali ke Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-4 border-t border-indigo-100 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-500">
            &copy; 2025 AutoLib. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
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
      `}</style>
    </div>
  );
}