'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/types';
import { bookService } from '@/lib/api';
import { Loader, TrendingUp, Award, Star } from 'lucide-react';

export default function BestsellersPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchBestsellers();
  }, [timeframe]);

  const fetchBestsellers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all books and sort by rating and review count
      const response = await bookService.getBooks(1, 20);
      
      // Sort by review count (bestsellers = most reviewed and highly rated)
      const bestsellers = [...response.data.data]
        .filter(book => book.rating >= 4.0) // Only show well-rated books
        .sort((a, b) => {
          // Primary sort: review count (popularity)
          if (b.reviewCount !== a.reviewCount) {
            return b.reviewCount - a.reviewCount;
          }
          // Secondary sort: rating
          return b.rating - a.rating;
        })
        .slice(0, 12); // Top 12 bestsellers

      setBooks(bestsellers);
    } catch (err) {
      setError('Failed to load bestsellers');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        onSearch={(q) => router.push(`/search?q=${q}`)}
        isAuthenticated={false}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Bestsellers</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Most popular books loved by our readers
          </p>

          {/* Timeframe Selector */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={timeframe === 'week' ? 'default' : 'outline'}
              onClick={() => setTimeframe('week')}
              size="sm"
            >
              This Week
            </Button>
            <Button
              variant={timeframe === 'month' ? 'default' : 'outline'}
              onClick={() => setTimeframe('month')}
              size="sm"
            >
              This Month
            </Button>
            <Button
              variant={timeframe === 'year' ? 'default' : 'outline'}
              onClick={() => setTimeframe('year')}
              size="sm"
            >
              This Year
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{books.length}</p>
              <p className="text-sm text-muted-foreground">Top Books</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">
                {(books.reduce((sum, book) => sum + book.rating, 0) / books.length).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                {books.reduce((sum, book) => sum + book.reviewCount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin" size={32} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchBestsellers}>Try Again</Button>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No bestsellers available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <div key={book._id} className="relative">
                {/* Ranking Badge */}
                {index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      'bg-orange-600'
                    }`}>
                      #{index + 1}
                    </div>
                  </div>
                )}
                {index >= 3 && (
                  <Badge className="absolute top-2 left-2 z-10" variant="secondary">
                    #{index + 1}
                  </Badge>
                )}
                <BookCard
                  book={book}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Button onClick={() => router.push('/browse')} size="lg">
            Browse All Books
          </Button>
        </div>
      </main>
    </div>
  );
}
