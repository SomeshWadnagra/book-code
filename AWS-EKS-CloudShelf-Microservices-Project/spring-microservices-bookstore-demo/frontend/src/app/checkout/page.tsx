'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CartItem, Address } from '@/types';
import { cartService, userService, orderService, paymentService, shippingService } from '@/lib/api';
import { 
  Loader, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Truck
} from 'lucide-react';

type CheckoutStep = 'address' | 'payment' | 'review' | 'complete';

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Cart data
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  
  // Address data
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  
  // Payment data
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  
  // Shipping data
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [shippingCost, setShippingCost] = useState(5.99);
  
  // Order data
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      
      // Load cart
      const cartResponse = await cartService.getCart('user-123');
      setCartItems(cartResponse.data.items);
      const cartSubtotal = cartResponse.data.items.reduce((sum, item) => sum + item.subtotal, 0);
      setSubtotal(cartSubtotal);
      
      // Load saved addresses
      const profileResponse = await userService.getProfile('user-123');
      setAddresses(profileResponse.data.addresses || []);
      
      // Set default address if exists
      const defaultAddr = profileResponse.data.addresses?.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    } catch (err) {
      console.error('Failed to load checkout data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressNext = () => {
    if (!useNewAddress && !selectedAddress) {
      alert('Please select or add a shipping address');
      return;
    }
    
    if (useNewAddress) {
      const { street, city, state, postalCode } = newAddress;
      if (!street || !city || !state || !postalCode) {
        alert('Please fill in all address fields');
        return;
      }
    }
    
    setCurrentStep('payment');
  };

  const handlePaymentNext = async () => {
    if (paymentMethod === 'card') {
      const { number, name, expiry, cvv } = cardDetails;
      if (!number || !name || !expiry || !cvv) {
        alert('Please fill in all card details');
        return;
      }
      
      // Basic validation
      if (number.replace(/\s/g, '').length < 13) {
        alert('Please enter a valid card number');
        return;
      }
    }
    
    // Get shipping quote
    try {
      setProcessing(true);
      const address = useNewAddress ? newAddress : selectedAddress;
      const shippingQuote = await shippingService.getShippingQuote('order-temp', address);
      setShippingCost(shippingMethod === 'express' ? 15.99 : 5.99);
      setCurrentStep('review');
    } catch (err) {
      console.error('Failed to get shipping quote:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      
      const address = useNewAddress ? newAddress : selectedAddress;
      const items = cartItems.map(item => ({
        bookId: item.bookId,
        qty: item.quantity,
      }));
      
      // Create order
      const orderResponse = await orderService.createOrder('user-123', items, JSON.stringify(address));
      const newOrderId = orderResponse.data.orderId;
      
      // Create payment intent
      const paymentResponse = await paymentService.createPaymentIntent(
        newOrderId,
        total,
        'USD'
      );
      
      // Confirm payment
      await paymentService.confirmPayment(
        paymentResponse.data.intentId,
        paymentMethod
      );
      
      setOrderId(newOrderId);
      setCurrentStep('complete');
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const stepConfig = {
    address: { number: 1, title: 'Shipping Address', icon: MapPin },
    payment: { number: 2, title: 'Payment Method', icon: CreditCard },
    review: { number: 3, title: 'Review Order', icon: ShoppingBag },
    complete: { number: 4, title: 'Complete', icon: CheckCircle2 },
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

  if (cartItems.length === 0) {
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
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some books to your cart to checkout
              </p>
              <Button onClick={() => router.push('/')}>
                Browse Books
              </Button>
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

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            {Object.entries(stepConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = currentStep === key;
              const isComplete = stepConfig[currentStep].number > config.number;
              
              return (
                <div key={key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isComplete
                          ? 'bg-green-600 text-white'
                          : isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <Icon size={24} />
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {config.title}
                    </span>
                  </div>
                  
                  {key !== 'complete' && (
                    <div className={`w-16 h-1 mb-8 mx-4 ${
                      isComplete ? 'bg-green-600' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {currentStep === 'address' && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Saved Addresses */}
                  {addresses.length > 0 && !useNewAddress && (
                    <div>
                      <h3 className="font-semibold mb-3">Select Address</h3>
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <button
                            key={addr._id}
                            onClick={() => setSelectedAddress(addr)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                              selectedAddress?._id === addr._id
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-muted-foreground'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{addr.street}</p>
                                <p className="text-muted-foreground">
                                  {addr.city}, {addr.state} {addr.postalCode}
                                </p>
                                <p className="text-muted-foreground">{addr.country}</p>
                              </div>
                              {addr.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Address Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setUseNewAddress(!useNewAddress)}
                    className="w-full"
                  >
                    {useNewAddress ? 'Use Saved Address' : 'Add New Address'}
                  </Button>

                  {/* New Address Form */}
                  {(useNewAddress || addresses.length === 0) && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">
                        {addresses.length === 0 ? 'Enter Shipping Address' : 'New Address'}
                      </h3>
                      <Input
                        placeholder="Street Address"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        />
                        <Input
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Postal Code"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        />
                        <Input
                          placeholder="Country"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleAddressNext} size="lg">
                      Continue to Payment
                      <ChevronRight className="ml-2" size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="font-semibold mb-3">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground'
                        }`}
                      >
                        <CreditCard className="mx-auto mb-2" size={32} />
                        <p className="font-semibold">Credit/Debit Card</p>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          paymentMethod === 'paypal'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground'
                        }`}
                      >
                        <div className="text-3xl mb-2">💳</div>
                        <p className="font-semibold">PayPal</p>
                      </button>
                    </div>
                  </div>

                  {/* Card Details Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Card Details</h3>
                      <Input
                        placeholder="Card Number"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        maxLength={19}
                      />
                      <Input
                        placeholder="Cardholder Name"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          maxLength={5}
                        />
                        <Input
                          placeholder="CVV"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          maxLength={4}
                          type="password"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="p-6 bg-muted/50 rounded-lg text-center">
                      <p className="text-muted-foreground">
                        You will be redirected to PayPal to complete your payment
                      </p>
                    </div>
                  )}

                  {/* Shipping Method */}
                  <div>
                    <h3 className="font-semibold mb-3">Shipping Method</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setShippingMethod('standard');
                          setShippingCost(5.99);
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          shippingMethod === 'standard'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Truck size={24} />
                            <div>
                              <p className="font-semibold">Standard Shipping</p>
                              <p className="text-sm text-muted-foreground">5-7 business days</p>
                            </div>
                          </div>
                          <p className="font-bold">$5.99</p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShippingMethod('express');
                          setShippingCost(15.99);
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          shippingMethod === 'express'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Truck size={24} />
                            <div>
                              <p className="font-semibold">Express Shipping</p>
                              <p className="text-sm text-muted-foreground">2-3 business days</p>
                            </div>
                          </div>
                          <p className="font-bold">$15.99</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('address')}
                      size="lg"
                    >
                      <ChevronLeft className="mr-2" size={20} />
                      Back
                    </Button>
                    <Button 
                      onClick={handlePaymentNext} 
                      size="lg"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader className="animate-spin mr-2" size={20} />
                          Processing...
                        </>
                      ) : (
                        <>
                          Review Order
                          <ChevronRight className="ml-2" size={20} />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 'review' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Address Review */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Shipping Address</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep('address')}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      {useNewAddress ? (
                        <>
                          <p>{newAddress.street}</p>
                          <p>{newAddress.city}, {newAddress.state} {newAddress.postalCode}</p>
                          <p>{newAddress.country}</p>
                        </>
                      ) : selectedAddress && (
                        <>
                          <p>{selectedAddress.street}</p>
                          <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
                          <p>{selectedAddress.country}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment Method Review */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Payment Method</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep('payment')}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-semibold">
                        {paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}
                      </p>
                      {paymentMethod === 'card' && cardDetails.number && (
                        <p className="text-muted-foreground">
                          Card ending in {cardDetails.number.slice(-4)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Method Review */}
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Method</h3>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-semibold">
                        {shippingMethod === 'standard' ? 'Standard Shipping' : 'Express Shipping'}
                      </p>
                      <p className="text-muted-foreground">
                        {shippingMethod === 'standard' ? '5-7 business days' : '2-3 business days'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.bookId} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{item.book.title}</p>
                            <p className="text-sm text-muted-foreground">{item.book.author}</p>
                            <p className="text-sm">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('payment')}
                      size="lg"
                    >
                      <ChevronLeft className="mr-2" size={20} />
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      size="lg"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader className="animate-spin mr-2" size={20} />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          Place Order - ${total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Order Complete */}
            {currentStep === 'complete' && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Order Placed Successfully!</h2>
                  <p className="text-muted-foreground mb-2">
                    Thank you for your order. Your order number is:
                  </p>
                  <p className="text-2xl font-bold text-primary mb-6">
                    {orderId}
                  </p>
                  <p className="text-muted-foreground mb-8">
                    We've sent a confirmation email with your order details.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => router.push('/orders')} size="lg">
                      View Order
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/')}
                      size="lg"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== 'complete' && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-3">Items in Order</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.bookId} className="flex gap-2 text-sm">
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-xs">{item.book.title}</p>
                            <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
