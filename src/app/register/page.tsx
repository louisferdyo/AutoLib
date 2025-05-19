'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {createClient} from '../../../lib/supabase'

export default function RegisterPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    setError('')
    setSuccess('')

    // 1. Sign up dulu user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, 
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message || 'Registrasi gagal')
      return
    }

    // 2. Kalau signUp berhasil, data.user.id ada di sini
    const userId = data.user?.id
    if (!userId) {
      setError('User ID tidak ditemukan setelah registrasi')
      return
    }

    // 3. Insert data tambahan ke tabel users
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: userId,
        email,
        full_name: fullName,
      }
    ])

    if (insertError) {
      setError('Gagal menyimpan data user: ' + insertError.message)
      return
    }

    setSuccess('Registrasi berhasil! Silakan login.')
    setTimeout(() => router.push('/login'), 1500)
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-4">Register</h1>

      <input
        type="text"
        placeholder="Full Name"
        className="border p-2 w-full mb-2"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full mb-2"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full mb-2"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Register
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  )
}
