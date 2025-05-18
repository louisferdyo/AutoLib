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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Library Books</h1>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            className="w-full p-2 border rounded"
            onChange={handleSearchChange}
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            className="w-full p-2 border rounded"
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Books Grid */}
      {!loading && books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No books found. Try adjusting your search criteria.</p>
        </div>
      )}
      
      {!loading && books.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.map(book => (
            <Link href={`/books/${book.id}`} key={book.id}>
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="relative h-64 w-full bg-gray-200">
                  {book.cover_image_url ? (
                    <Image 
                      src={book.cover_image_url} 
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                      No Cover Image
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h2>
                  <p className="text-gray-600 mb-2">{book.author}</p>
                  <div className="mt-auto flex flex-wrap gap-1">
                    {book.categories && book.categories.slice(0, 2).map(category => (
                      <span key={category} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {category}
                      </span>
                    ))}
                    {book.categories && book.categories.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        +{book.categories.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className={`font-medium ${book.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
              className="px-3 py-1 rounded border disabled:opacity-50"
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
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        pagination.page === page
                          ? 'bg-blue-500 text-white'
                          : 'border hover:bg-gray-100'
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
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}