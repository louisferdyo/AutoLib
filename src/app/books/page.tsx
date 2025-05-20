'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { debounce } from 'lodash';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  synopsis: string;
  categories: string[];
  cover_image_url: string;
  available_quantity: number;
  total_quantity: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Function to fetch books
  const fetchBooks = async (page = 1, query = searchQuery, category = selectedCategory) => {
    setLoading(true);
    try {
      let url = `/api/books?page=${page}&limit=${pagination.limit}`;
      
      if (query) {
        url += `&query=${encodeURIComponent(query)}`;
      }
      
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setBooks(data.books);
        setPagination(data.pagination);
      } else {
        console.error('Error fetching books:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/books/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories);
      } else {
        console.error('Error fetching categories:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  
  // Initialize
  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);
  
  // Debounced search handler
  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value);
    fetchBooks(1, value, selectedCategory);
  }, 500);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };
  
  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    fetchBooks(1, searchQuery, value);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    fetchBooks(page, searchQuery, selectedCategory);
  };
  
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
      <div className="container mx-auto px-4 py-8 relative z-10 flex-grow">
        <h1 className="text-2xl font-bold mb-6 text-indigo-700">Library Books</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-indigo-200 rounded-lg shadow-sm placeholder-indigo-300 text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm sm:text-sm"
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-full sm:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <select
              className="w-full pl-10 pr-3 py-2 border border-indigo-200 rounded-lg shadow-sm placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm appearance-none"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {/* Books Grid */}
        {!loading && books.length === 0 && (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
            <p className="text-lg text-indigo-600">No books found. Try adjusting your search criteria.</p>
          </div>
        )}
        
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map(book => (
              <Link href={`/books/${book.id}`} key={book.id}>
                <div className="border border-indigo-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-white/70 backdrop-blur-sm transform hover:scale-105">
                  <div className="relative h-64 w-full bg-indigo-50">
                    {book.cover_image_url ? (
                      <Image 
                        src={book.cover_image_url} 
                        alt={book.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                        No Cover Image
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="font-semibold text-lg mb-1 line-clamp-2 text-indigo-700">{book.title}</h2>
                    <p className="text-purple-600 mb-2">{book.author}</p>
                    <div className="mt-auto flex flex-wrap gap-1">
                      {book.categories && book.categories.slice(0, 2).map(category => (
                        <span key={category} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                          {category}
                        </span>
                      ))}
                      {book.categories && book.categories.length > 2 && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          +{book.categories.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className={`font-medium ${book.available_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {book.available_quantity > 0 ? `${book.available_quantity} available` : 'Not available'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 rounded-lg border border-indigo-200 bg-white/70 backdrop-blur-sm disabled:opacity-50 text-indigo-600 hover:bg-indigo-50 transition-colors duration-300"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first, last, current page, and pages around current
                  return page === 1 || 
                         page === pagination.totalPages || 
                         Math.abs(page - pagination.page) <= 1;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there are gaps
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-indigo-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-300 ${
                          pagination.page === page
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                            : 'border border-indigo-200 hover:bg-indigo-50 text-indigo-600 bg-white/70 backdrop-blur-sm'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 rounded-lg border border-indigo-200 bg-white/70 backdrop-blur-sm disabled:opacity-50 text-indigo-600 hover:bg-indigo-50 transition-colors duration-300"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-4 border-t border-indigo-100 relative z-10 mt-auto">
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
  );
}