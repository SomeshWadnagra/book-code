'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Book } from '@/types';
import { bookService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userName } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks(1, 12);
      setBooks(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleAddToCart = (book: Book) => {
    console.log('Added to cart:', book.title);
  };

  const handleAddToWishlist = (book: Book) => {
    console.log('Added to wishlist:', book.title);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={0}
        wishlistCount={0}
        onSearch={handleSearch}
        isAuthenticated={isAuthenticated}
        userName={userName || undefined}
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
          <Button size="lg">Start Browsing</Button>
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
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    Browse
                  </a>
                </li>
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    Bestsellers
                  </a>
                </li>
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    Categories
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    DMCA
                  </a>
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
