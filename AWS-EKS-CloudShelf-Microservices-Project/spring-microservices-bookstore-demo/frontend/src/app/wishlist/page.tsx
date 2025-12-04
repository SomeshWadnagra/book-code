'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@/types';
import { userService, bookService, cartService, recommendationService } from '@/lib/api';
import { Loader, Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get wishlist book IDs
      const wishlistResponse = await userService.getWishlist('user-123');
      const bookIds = wishlistResponse.data;

      if (bookIds.length === 0) {
        setWishlistBooks([]);
        setLoading(false);
        return;
      }

      // Fetch book details for each ID
      const bookPromises = bookIds.map(id => bookService.getBookById(id));
      const bookResponses = await Promise.all(bookPromises);
      const books = bookResponses.map(response => response.data);
      
      setWishlistBooks(books);

      // Fetch recommendations based on wishlist
      const recoResponse = await recommendationService.getUserRecommendations('user-123');
      setRecommendations(recoResponse.data.slice(0, 4));
    } catch (err) {
      setError('Failed to load wishlist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      setRemovingId(bookId);
      await userService.removeFromWishlist('user-123', bookId);
      setWishlistBooks(books => books.filter(book => book._id !== bookId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (book: Book) => {
    try {
      setAddingToCart(book._id);
      await cartService.addToCart('user-123', book._id, 1);
      
      // Optionally remove from wishlist after adding to cart
      await handleRemoveFromWishlist(book._id);
      
      // Show success message (you can add toast notification here)
      console.log(`Added ${book.title} to cart and removed from wishlist`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleAddAllToCart = async () => {
    try {
      const promises = wishlistBooks.map(book =>
        cartService.addToCart('user-123', book._id, 1)
      );
      await Promise.all(promises);
      
      // Clear wishlist
      setWishlistBooks([]);
      
      // Navigate to cart
      router.push('/cart');
    } catch (err) {
      console.error('Failed to add all to cart:', err);
    }
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
          wishlistCount={wishlistBooks.length}
          onSearch={(q) => router.push(`/search?q=${q}`)}
          isAuthenticated={false}
        />
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchWishlist}>Try Again</Button>
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
        wishlistCount={wishlistBooks.length}
        onSearch={(q) => router.push(`/search?q=${q}`)}
        isAuthenticated={false}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlistBooks.length} {wishlistBooks.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>

          {wishlistBooks.length > 0 && (
            <Button onClick={handleAddAllToCart} size="lg">
              <ShoppingCart className="mr-2" size={20} />
              Add All to Cart
            </Button>
          )}
        </div>

        {wishlistBooks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save books you love to read later
              </p>
              <Button onClick={() => router.push('/')}>
                Browse Books
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Wishlist Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {wishlistBooks.map((book) => (
                <div key={book._id} className="relative group">
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(book._id)}
                    disabled={removingId === book._id}
                    className="absolute top-2 right-2 z-10 p-2 bg-background/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                  >
                    {removingId === book._id ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>

                  {/* Book Card */}
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div
                      className="aspect-[2/3] overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/books/${book._id}`)}
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3
                        className="font-semibold mb-1 line-clamp-2 cursor-pointer hover:text-primary"
                        onClick={() => router.push(`/books/${book._id}`)}
                      >
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {book.author}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary">
                          ${book.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-semibold">{book.rating}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => handleAddToCart(book)}
                          disabled={!book.inStock || addingToCart === book._id}
                        >
                          {addingToCart === book._id ? (
                            <>
                              <Loader className="animate-spin mr-2" size={16} />
                              Adding...
                            </>
                          ) : !book.inStock ? (
                            'Out of Stock'
                          ) : (
                            <>
                              <ShoppingCart className="mr-2" size={16} />
                              Add to Cart
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push(`/books/${book._id}`)}
                        >
                          View Details
                        </Button>
                      </div>

                      {!book.inStock && (
                        <p className="text-xs text-destructive mt-2 text-center">
                          Currently unavailable
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    You Might Also Like
                  </h2>
                  <p className="text-muted-foreground">
                    Based on your wishlist preferences
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.map((book) => (
                    <BookCard
                      key={book._id}
                      book={book}
                      onAddToCart={async (b) => {
                        await cartService.addToCart('user-123', b._id, 1);
                        console.log(`Added ${b.title} to cart`);
                      }}
                      onAddToWishlist={async (b) => {
                        await userService.addToWishlist('user-123', b._id);
                        setWishlistBooks(prev => [...prev, b]);
                        console.log(`Added ${b.title} to wishlist`);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Wishlist Tips */}
        {wishlistBooks.length > 0 && (
          <Card className="mt-12 bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Wishlist Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your wishlist is saved and accessible from any device</li>
                    <li>• We'll notify you when wishlist items go on sale</li>
                    <li>• Share your wishlist with friends and family</li>
                    <li>• Books in your wishlist won't be reserved - add to cart to secure them</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
