'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  full_name: string;
  card_id: string | null;
};

type CardRegistrationFormProps = {
  user: User;
  esp32Ip: string;
};

export default function CardRegistrationForm({ user, esp32Ip  }: CardRegistrationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'waiting' | 'success' | 'error'>('idle');
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Clear any intervals when component unmounts
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const initiateCardRegistration = async () => {
    setIsLoading(true);
    setError('');
    setStatusMessage('Mengirim permintaan pendaftaran ke perangkat...');
    
    try {
      // Use our proxy API to communicate with ESP32
      const response = await fetch('/api/esp32', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'registerCard',
          user_id: user.id,
          esp32Ip, 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim permintaan pendaftaran');
      }

      setStatusMessage('Silakan tempelkan kartu RFID Anda pada perangkat reader...');
      setRegistrationStatus('waiting');
      
      // Setup polling to check registration status
      const interval = setInterval(checkRegistrationStatus, 2000); // Poll every 2 seconds
      setStatusCheckInterval(interval);
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim permintaan');
      setRegistrationStatus('error');
      setIsLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      // Check ESP32 status through our proxy API
      const response = await fetch('/api/esp32', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Gagal memeriksa status perangkat');
      }

      const data = await response.json();
      
      // If ESP32 is no longer in registration mode, it means either:
      // 1. Registration completed successfully
      // 2. Registration timed out
      // 3. Some error occurred
      if (data.status !== 'registering') {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        
        // Check if user now has a card_id by fetching latest user data
        await checkUserCardStatus();
      }
    } catch (err) {
      // Network error or proxy error - continue polling
      console.error('Error checking device status:', err);
    }
  };

  const checkUserCardStatus = async () => {
    try {
      // Fetch latest user data to see if card_id was updated
      const response = await fetch('/api/users/me', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Gagal memeriksa status kartu');
      }

      const userData = await response.json();
      
      if (userData.card_id) {
        // Registration successful
        setStatusMessage('Kartu berhasil didaftarkan!');
        setRegistrationStatus('success');
        setIsLoading(false);
        
        // Update UI after a delay
        setTimeout(() => {
          router.refresh(); // Refresh page to show updated card info
        }, 2000);
      } else {
        // Registration failed or timed out
        setStatusMessage('Pendaftaran kartu gagal atau waktu habis. Silakan coba lagi.');
        setRegistrationStatus('error');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memeriksa status kartu');
      setRegistrationStatus('error');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Informasi Pengguna</h2>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nama</p>
            <p>{user.full_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p>{user.email}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h2 className="text-lg font-medium">Status Kartu</h2>
        
        {user.card_id ? (
          <div className="mt-2">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Kartu Sudah Terdaftar</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Anda sudah memiliki kartu yang terdaftar dengan ID: {user.card_id}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={initiateCardRegistration}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Daftarkan Kartu Baru
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Belum Ada Kartu Terdaftar</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Anda belum memiliki kartu RFID yang terdaftar. Silakan daftarkan kartu Anda.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        {registrationStatus === 'idle' && !user.card_id && (
          <button
            type="button"
            onClick={initiateCardRegistration}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Daftarkan Kartu
          </button>
        )}

        {registrationStatus === 'waiting' && (
          <div className="text-center">
            <div className="animate-pulse rounded-full bg-indigo-100 p-4 mb-4">
              <svg className="h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <p className="font-medium">{statusMessage}</p>
            <p className="text-sm text-gray-500 mt-2">Jangan pindahkan kartu sampai proses selesai...</p>
          </div>
        )}
      </div>
    </div>
  );
}