'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 font-sans">
      {/* Header/Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-purple-600 hover:text-purple-800 transition duration-300">
                  <span className="text-indigo-600">Auto</span>Lib
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link href="/login" className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition duration-300">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-sm transition duration-300">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Decorative circles */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left column - Hero text */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-indigo-800 mb-6 leading-tight">
                Digital Library <span className="text-purple-600 block">and Smart Locker</span>
              </h1>
              <p className="text-lg text-indigo-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Pinjam buku favorit Anda dengan mudah melalui sistem smart locker berbasis RFID. Nikmati akses 24/7 ke perpustakaan digital kami.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register">
                  <button className="px-8 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-md font-semibold transition-all duration-300 transform hover:scale-105">
                    Daftar Sekarang
                  </button>
                </Link>
                <Link href="/books">
                  <button className="px-8 py-3 text-indigo-700 bg-white/80 backdrop-blur-sm border border-indigo-200 hover:bg-indigo-50 rounded-lg shadow-sm font-semibold transition-all duration-300">
                    Jelajahi Buku
                  </button>
                </Link>
              </div>
            </div>

            {/* Right column - Card visual */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md h-80 transform -rotate-6 transition-transform duration-500 hover:rotate-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-full bg-white/10 backdrop-blur-sm opacity-20"></div>
                  <div className="absolute right-6 top-6 h-4 w-8 bg-yellow-300 rounded-sm"></div>
                  <div className="absolute left-10 top-10">
                    <div className="flex space-x-2">
                      <div className="w-20 h-2 bg-blue-200 rounded-full"></div>
                      <div className="w-10 h-2 bg-blue-200 rounded-full"></div>
                    </div>
                  </div>
                  <div className="absolute right-8 top-24 w-32 h-24 bg-white/10 backdrop-blur-sm rounded-xl transform -rotate-6 border border-white/30"></div>
                  <div className="absolute left-8 bottom-24 w-40 h-10 bg-white/20 backdrop-blur-sm rounded-lg"></div>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-indigo-800/50 via-transparent to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="text-white text-xl font-bold">AutoLib RFID</div>
                    <div className="text-blue-100 text-sm">Smart Library Access</div>
                  </div>
                </div>

                {/* Stacked Books Visual */}
                <div className="absolute -right-12 -bottom-6 transform rotate-12 w-32">
                  <div className="relative h-32 w-24 bg-indigo-600 rounded-r border-l-8 border-indigo-800 shadow-lg transform -rotate-6">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-r"></div>
                  </div>
                  <div className="absolute top-4 -left-4 h-32 w-24 bg-purple-600 rounded-r border-l-8 border-purple-800 shadow-lg transform -rotate-3">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-r"></div>
                  </div>
                  <div className="absolute top-8 -left-8 h-32 w-24 bg-blue-600 rounded-r border-l-8 border-blue-800 shadow-lg">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-r"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-indigo-100 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">Kartu RFID</h3>
              <p className="text-indigo-600">Akses perpustakaan dengan mudah menggunakan kartu RFID pribadi Anda.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-indigo-100 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">Koleksi Digital</h3>
              <p className="text-indigo-600">Jelajahi ribuan buku dan sumber digital dalam katalog kami.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-indigo-100 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">Smart Locker</h3>
              <p className="text-indigo-600">Pinjam dan kembalikan buku 24/7 melalui sistem loker pintar kami.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-4 border-t border-indigo-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-500">
            &copy; 2025 AutoLib. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Font fix & Animation*/}
      <style jsx global>{`
        html, body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          background: linear-gradient(to bottom right, #dbeafe, #f3e8ff, #e0e7ff);
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
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
  )
}