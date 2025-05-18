'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../lib/supabase';

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  // Password states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      // Ganti .single() dengan .maybeSingle() agar tidak error jika data kosong
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setMessage({ text: 'User tidak ditemukan', type: 'error' });
        setUser(null);
      } else {
        setUser(data);
        setFullName(data.full_name || '');
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message || error);
      setMessage({ text: 'Gagal memuat profil pengguna', type: 'error' });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ text: 'Profil berhasil diperbarui!', type: 'success' });
      // Update state user supaya sinkron
      setUser((prev) => (prev ? { ...prev, full_name: fullName } : prev));
    } catch (error: any) {
      console.error('Error updating profile:', error.message || error);
      setMessage({ text: error.message || 'Gagal memperbarui profil', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const updatePassword = async () => {
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password harus minimal 6 karakter');
      return;
    }

    setUpdating(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage({ text: 'Password berhasil diperbarui!', type: 'success' });
      setShowPasswordForm(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Gagal memperbarui password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profil Pengguna</h1>
          <button
            onClick={() => router.push('/activities')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Lihat Aktivitas Pengguna
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">Email tidak dapat diubah</p>
          </div>

          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              id="role"
              value={user?.role || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100"
            />
          </div>

          <button
            onClick={updateProfile}
            disabled={updating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>

          {message.text && (
            <div
              className={`mt-4 p-3 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Keamanan Akun</h2>

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
            >
              Ubah Password
            </button>
          ) : (
            <div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              {passwordError && (
                <div className="mb-4 p-3 rounded-md bg-red-50 text-red-800">{passwordError}</div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={updatePassword}
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  {updating ? 'Menyimpan...' : 'Simpan Password Baru'}
                </button>

                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Kembali ke Dashboard
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
