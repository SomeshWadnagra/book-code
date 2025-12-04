'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Book } from '@/types';
import { getDummyBooks } from '@/lib/dummyData';
import { Loader } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  // Simulates API call but uses dummy data
  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get dummy data instead of API
      const dummyData = getDummyBooks(1, 12);
      setBooks(dummyData.data);
      setError(null);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search:', query);
    // TODO: Navigate to search page with query
  };

  const handleAddToCart = (book: Book) => {
    console.log('Added to cart:', book.title);
    // TODO: Implement cart functionality
  };

  const handleAddToWishlist = (book: Book) => {
    console.log('Added to wishlist:', book.title);
    // TODO: Implement wishlist functionality
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={0}
        wishlistCount={0}
        onSearch={handleSearch}
        isAuthenticated={false}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to BookVerse
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Discover millions of digital books across all genres
          </p>
          <Link href="/browse">
            <Button size="lg">Start Browsing</Button>
          </Link>
        </div>

        {/* Testing Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-900">
            ℹ️ <strong>Testing Mode:</strong> Currently using dummy data for demonstration. 
            Connect to your API to fetch real books.
          </p>
        </div>

        {/* Books Grid */}
        {error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBooks}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin" size={32} />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No books available</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Featured Books ({books.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">About BookVerse</h3>
              <p className="text-sm text-muted-foreground">
                Your one-stop shop for digital books and publications.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/browse" className="text-muted-foreground hover:text-primary">
                    Browse
                  </Link>
                </li>
                <li>
                  <Link href="/bestsellers" className="text-muted-foreground hover:text-primary">
                    Bestsellers
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-muted-foreground hover:text-primary">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/dmca" className="text-muted-foreground hover:text-primary">
                    DMCA
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 BookVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
