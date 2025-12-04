'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem } from '@/types';
import { cartService, pricingService } from '@/lib/api';
import { Loader, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal - discount + shipping + tax;

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);

      // This will use dummy data or real cart service based on env
      const response = await cartService.getCart('user-123');
      setCartItems(response.data.items);
    } catch (err) {
      setError('Failed to load cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(itemId);
      const item = cartItems.find((i) => i.bookId === itemId);
      if (!item) return;

      // Update cart via API
      await cartService.updateCartItem('user-123', itemId, newQuantity);

      // Update local state
      setCartItems((items) =>
        items.map((i) =>
          i.bookId === itemId
            ? {
                ...i,
                quantity: newQuantity,
                subtotal: i.price * newQuantity,
              }
            : i
        )
      );
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      await cartService.removeCartItem('user-123', itemId);
      setCartItems((items) => items.filter((i) => i.bookId !== itemId));
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setUpdating(null);
    }
  };

  const applyCoupon = async () => {
    try {
      const response = await pricingService.validateCoupon(couponCode, 'user-123');
      if (response.data.valid) {
        setDiscount(response.data.discountAmount);
        setCouponApplied(true);
      }
    } catch (err) {
      console.error('Invalid coupon:', err);
    }
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) return;
    router.push('/checkout');
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
          cartCount={cartItems.length}
          wishlistCount={0}
          onSearch={(q) => router.push(`/search?q=${q}`)}
          isAuthenticated={false}
        />
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchCart}>Try Again</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartItems.length}
        wishlistCount={0}
        onSearch={(q) => router.push(`/search?q=${q}`)}
        isAuthenticated={false}
      />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding some books to get started!
              </p>
              <Button onClick={() => router.push('/')}>
                Browse Books
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.bookId}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Book Image */}
                      <div
                        className="w-24 h-32 flex-shrink-0 rounded overflow-hidden cursor-pointer"
                        onClick={() => router.push(`/books/${item.bookId}`)}
                      >
                        <img
                          src={item.book.coverImage}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary truncate"
                          onClick={() => router.push(`/books/${item.bookId}`)}
                        >
                          {item.book.title}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          by {item.book.author}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {item.book.category}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.bookId, item.quantity - 1)
                              }
                              disabled={updating === item.bookId}
                              className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 border-x">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.bookId, item.quantity + 1)
                              }
                              disabled={
                                updating === item.bookId ||
                                item.quantity >= item.book.stockCount
                              }
                              className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.bookId)}
                            disabled={updating === item.bookId}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>

                        {item.book.stockCount < 5 && (
                          <p className="text-sm text-destructive mt-2">
                            Only {item.book.stockCount} left in stock
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${item.subtotal.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponApplied}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                        placeholder="Enter code"
                      />
                      <Button
                        onClick={applyCoupon}
                        disabled={!couponCode || couponApplied}
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponApplied && (
                      <p className="text-sm text-green-600 mt-1">
                        Coupon applied! -${discount.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subtotal ({cartItems.length} items)
                      </span>
                      <span className="font-semibold">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Shipping
                        {shipping === 0 && (
                          <span className="text-green-600 ml-1">(Free)</span>
                        )}
                      </span>
                      <span className="font-semibold">
                        ${shipping.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>

                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Add ${(50 - subtotal).toFixed(2)} more for free shipping
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={proceedToCheckout}
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2" size={20} />
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => router.push('/')}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
