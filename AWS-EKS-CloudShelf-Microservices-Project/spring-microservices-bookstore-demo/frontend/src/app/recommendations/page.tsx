'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@/types';
import { recommendationService, bookService } from '@/lib/api';
import { Loader, Sparkles, Heart, TrendingUp, BookOpen } from 'lucide-react';

export default function RecommendationsPage() {
  const router = useRouter();
  const [personalizedBooks, setPersonalizedBooks] = useState<Book[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [newReleases, setNewReleases] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch personalized recommendations
      const recoResponse = await recommendationService.getUserRecommendations('user-123');
      setPersonalizedBooks(recoResponse.data.slice(0, 4));

      // Fetch all books for trending and new releases
      const booksResponse = await bookService.getBooks(1, 12);
      const allBooks = booksResponse.data.data;

      // Trending: Sort by rating and review count
      const trending = [...allBooks]
        .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
        .slice(0, 4);
      setTrendingBooks(trending);

      // New Releases: Sort by published date (newest first)
      const newBooks = [...allBooks]
        .sort((a, b) => {
          const dateA = new Date(a.publishedDate || 0);
          const dateB = new Date(b.publishedDate || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 4);
      setNewReleases(newBooks);
    } catch (err) {
      setError('Failed to load recommendations');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          cartCount={0}
          wishlistCount={0}
          onSearch={(q) => router.push(`/search?q=${q}`)}
          isAuthenticated={false}
        />
        <main className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin" size={32} />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          cartCount={0}
          wishlistCount={0}
          onSearch={(q) => router.push(`/search?q=${q}`)}
          isAuthenticated={false}
        />
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchRecommendations}>Try Again</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
            <Sparkles className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Recommendations For You
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Personalized book suggestions based on your interests
          </p>
        </div>

        {/* Personalized Recommendations */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Picked Just For You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personalizedBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>
        </section>

        {/* Trending Now */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">New Releases</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newReleases.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>
        </section>

        {/* Recommendation Info Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <Sparkles className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  How We Recommend Books
                </h3>
                <p className="text-muted-foreground mb-4">
                  Our recommendation engine analyzes your reading history, wishlist, 
                  and browsing patterns to suggest books you'll love. We also consider 
                  what similar readers enjoyed to bring you the best personalized suggestions.
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => router.push('/profile')}>
                    Update Preferences
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/browse')}>
                    Browse All Books
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
