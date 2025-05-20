'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EnhancedHeroIllustration from '../component/EnhancedHeroIllustration'

export default function HomePage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check window width on component mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIsMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 font-sans">
      {/* Navigation */}
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
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              <Link 
                href="/books" 
                className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 border-b-2 border-transparent hover:border-indigo-500 transition duration-300"
              >
                Books
              </Link>
              <Link 
                href="/login" 
                className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 border-b-2 border-transparent hover:border-indigo-500 transition duration-300"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register
              </Link>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/books"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-800 transition duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Books
            </Link>
            <Link
              href="/login"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-800 transition duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Decorative circles */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b z-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-indigo-50 transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-3xl tracking-tight font-extrabold text-indigo-900 sm:text-4xl md:text-5xl lg:text-6xl">
                  <span className="block xl:inline">Digital Library</span>{' '}
                  <span className="block text-indigo-600 xl:inline">and Smart Locker</span>
                </h1>
                <p className="mt-3 text-base text-indigo-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover thousands of books, manage your reading list, and borrow your favorite titles all in one place with our RFID-based smart locker system.
                </p>
                <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button
                      onClick={() => router.push('/books')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out md:py-4 md:text-lg md:px-10 relative z-10"
                    >
                      Browse Books
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <button
                      onClick={() => router.push('/register')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-700 bg-white/70 backdrop-blur-sm hover:bg-indigo-50 transform hover:-translate-y-1 hover:shadow-md transition-all duration-300 ease-in-out md:py-4 md:text-lg md:px-10 relative z-10"
                    >
                      Get RFID Card
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full">
            <EnhancedHeroIllustration />
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="py-12 md:py-16 bg-white/80 backdrop-blur-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-2xl sm:text-3xl leading-8 font-extrabold tracking-tight text-indigo-800 md:text-4xl">
              A better way to manage your library
            </p>
            <p className="mt-4 max-w-2xl text-lg sm:text-xl text-indigo-600 mx-auto">
              Everything you need to keep track of your books, borrowing history, and more.
            </p>
          </div>

          <div className="mt-10 md:mt-12">
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-2 md:gap-x-8 md:gap-y-8">
              {/* Feature 1 */}
              <div className="relative bg-white/90 p-5 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-indigo-800">RFID Membership Registration</h3>
                  <p className="mt-2 text-sm sm:text-base text-indigo-600">
                    Register as a member and receive an RFID card for easy access to our smart locker system. No need to carry multiple cards - your identity is securely stored on your RFID card.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative bg-white/90 p-5 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-indigo-800">Book Borrowing & Return</h3>
                  <p className="mt-2 text-sm sm:text-base text-indigo-600">
                    Borrow and return books 24/7 through our smart locker system. Simply scan your RFID card, pick up or return your books, and you're done - no waiting in line or paperwork.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative bg-white/90 p-5 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-indigo-800">Loan Extension</h3>
                  <p className="mt-2 text-sm sm:text-base text-indigo-600">
                    Need more time with your books? Extend your borrowing period directly from the app or website without visiting the library. Get automatic notifications before due dates.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative bg-white/90 p-5 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-indigo-800">Book Status Tracking</h3>
                  <p className="mt-2 text-sm sm:text-base text-indigo-600">
                    Check real-time book availability and status. View which books are available, which are currently borrowed, and track your own borrowed books all in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12 md:py-16 bg-white/50 backdrop-blur-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-2xl sm:text-3xl leading-8 font-extrabold tracking-tight text-indigo-800 md:text-4xl">
              Simple steps to get started
            </p>
            <p className="mt-4 max-w-2xl text-lg sm:text-xl text-indigo-600 mx-auto">
              Our RFID-based automated library system makes borrowing books easier than ever before.
            </p>
          </div>

          <div className="mt-10 md:mt-12">
            <div className="space-y-8 md:space-y-0 md:grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {/* Step 1 */}
              <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 text-indigo-600 text-lg sm:text-xl font-bold mb-4 mx-auto">
                  1
                </div>
                <div className="text-center">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-indigo-800">Register & Get RFID Card</h3>
                  <p className="mt-2 text-sm sm:text-base text-indigo-600">
                    Create your account and receive your personal RFID card for secure access.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 text-indigo-600 text-lg sm:text-xl font-bold mb-4 mx-auto">
                  2
                </div>
                <div className="text-center">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-indigo-800">Browse & Reserve Books</h3>
                  <p className="mt-2 text-sm sm:text-base text-indigo-600">
                    Find books online and reserve them for pickup at your convenience.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 text-indigo-600 text-lg sm:text-xl font-bold mb-4 mx-auto">
                  3
                </div>
                <div className="text-center">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-indigo-800">Scan RFID at Smart Locker</h3>
                  <p className="mt-2 text-sm sm:text-base text-indigo-600">
                    Visit the smart locker, scan your RFID card, and the locker with your book opens automatically.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 text-indigo-600 text-lg sm:text-xl font-bold mb-4 mx-auto">
                  4
                </div>
                <div className="text-center">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-indigo-800">Return or Extend</h3>
                  <p className="mt-2 text-sm sm:text-base text-indigo-600">
                    Return books to any available locker or extend your borrowing period through the app.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RFID Technology Section */}
      <div className="py-12 md:py-16 bg-white/80 backdrop-blur-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">RFID Technology</h2>
              <p className="mt-2 text-2xl sm:text-3xl leading-8 font-extrabold tracking-tight text-indigo-800">
                Smart Technology for a Smarter Library
              </p>
              <p className="mt-4 text-base sm:text-lg text-indigo-600">
                Our smart locker system uses RFID (Radio Frequency Identification) technology to streamline the borrowing and returning process. Your RFID card securely stores your membership information, allowing you to access the locker system with a simple tap.
              </p>
              <ul className="mt-6 space-y-3 sm:space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm sm:text-base text-indigo-600">
                    <span className="font-medium text-indigo-800">Secure Authentication:</span> Your RFID card can only be used by you
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm sm:text-base text-indigo-600">
                    <span className="font-medium text-indigo-800">Contactless:</span> No need to manually enter information
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm sm:text-base text-indigo-600">
                    <span className="font-medium text-indigo-800">Fast Access:</span> Opens lockers in less than 2 seconds
                  </p>
                </li>
              </ul>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2 flex justify-center">
              <div className="w-60 sm:w-72 h-40 sm:h-48 bg-indigo-100 rounded-lg shadow-md flex items-center justify-center p-4 sm:p-6">
                <div className="relative w-36 sm:w-48 h-24 sm:h-32 bg-white/50 backdrop-blur-sm rounded-md shadow-sm transform rotate-6 transition-transform duration-300 hover:rotate-0">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-md p-3 sm:p-4">
                    <div className="h-3 sm:h-4 w-6 sm:w-8 bg-yellow-300 rounded-sm absolute right-3 sm:right-4 top-3 sm:top-4"></div>
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white text-xs sm:text-sm">
                      <div className="font-bold">AutoLib Member</div>
                      <div className="mt-1">ID: 123456789</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto py-10 md:py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-800 md:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-indigo-600">Start your reading journey today.</span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => router.push('/register')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 hover:shadow-lg transition-all duration-300 relative z-10"
              >
                Get started
              </button>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-600 bg-white/80 backdrop-blur-sm hover:bg-indigo-50 transform hover:scale-105 hover:shadow-md transition-all duration-300 relative z-10"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm mt-auto relative z-10">
        <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link href="/books" className="text-sm sm:text-base text-indigo-500 hover:text-indigo-600 transition duration-300">
                Books
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/about" className="text-sm sm:text-base text-indigo-500 hover:text-indigo-600 transition duration-300">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/contact" className="text-sm sm:text-base text-indigo-500 hover:text-indigo-600 transition duration-300">
                Contact
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/faq" className="text-sm sm:text-base text-indigo-500 hover:text-indigo-600 transition duration-300">
                FAQ
              </Link>
            </div>
          </nav>
          <div className="mt-6 md:mt-8 flex justify-center space-x-6">
            <a href="#" className="text-indigo-400 hover:text-indigo-500 transition duration-300">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-indigo-400 hover:text-indigo-500 transition duration-300">
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-indigo-400 hover:text-indigo-500 transition duration-300">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <p className="mt-6 md:mt-8 text-center text-sm sm:text-base text-indigo-500">
            &copy; 2025 AutoLib. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Font and Animation */}
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
        
        button, a {
          position: relative;
          z-index: 10;
        }
      `}</style>
    </div>
  )
}