'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 to-blue-100">
      <div className="text-center p-8 bg-white shadow-xl rounded-xl max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">Welcome to BookTrack</h1>
        <p className="text-gray-600 mb-6">Track your books, activities, and transactions easily.</p>
        <div className="flex justify-center space-x-4">
          <Link href="/login">
            <button className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
