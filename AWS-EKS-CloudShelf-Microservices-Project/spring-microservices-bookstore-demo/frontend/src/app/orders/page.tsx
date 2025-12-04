'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { orderService, shippingService } from '@/lib/api';
import { 
  Loader, 
  Package, 
  Truck, 
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getUserOrders('user-123');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      
      // Fetch tracking info if not already loaded
      if (!trackingInfo[orderId]) {
        try {
          const order = orders.find(o => o._id === orderId);
          if (order?.trackingNumber) {
            const tracking = await shippingService.getTracking(order.trackingNumber);
            setTrackingInfo(prev => ({
              ...prev,
              [orderId]: tracking.data,
            }));
          }
        } catch (err) {
          console.error('Failed to fetch tracking:', err);
        }
      }
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
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
          wishlistCount={0}
          onSearch={(q) => router.push(`/search?q=${q}`)}
          isAuthenticated={false}
        />
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchOrders}>Try Again</Button>
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Order History</h1>
          <Button onClick={() => router.push('/')}>
            Continue Shopping
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                Your order history will appear here once you make your first purchase
              </p>
              <Button onClick={() => router.push('/')}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order._id}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleOrderExpand(order._id)}
                      >
                        {expandedOrder === order._id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Order Summary (Always Visible) */}
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Book Preview Images */}
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-16 rounded border-2 border-background overflow-hidden"
                            style={{ zIndex: 10 - idx }}
                          >
                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-semibold">
                              📚
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-12 h-16 rounded border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {order.items[0].title}
                          {order.items.length > 1 && ` and ${order.items.length - 1} more`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {order.trackingNumber && (
                        <Button variant="outline" size="sm">
                          <Truck className="mr-2" size={16} />
                          Track Order
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/orders/${order._id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>

                {/* Expanded Order Details */}
                {expandedOrder === order._id && (
                  <CardContent className="border-t bg-muted/10 p-6 space-y-6">
                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold mb-3">Order Items</h3>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                📚
                              </div>
                              <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Status & Payment */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Order Status</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <span className="text-muted-foreground">Order Status</span>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <span className="text-muted-foreground">Payment Status</span>
                            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </Badge>
                          </div>
                          {order.trackingNumber && (
                            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                              <span className="text-muted-foreground">Tracking Number</span>
                              <code className="text-sm font-mono">{order.trackingNumber}</code>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Shipping Address</h3>
                        <div className="p-4 bg-background rounded-lg">
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                          <p>{order.shippingAddress.postalCode}</p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Information */}
                    {order.trackingNumber && trackingInfo[order._id] && (
                      <div>
                        <h3 className="font-semibold mb-3">Tracking Information</h3>
                        <div className="p-4 bg-background rounded-lg">
                          <div className="space-y-3">
                            {trackingInfo[order._id].events?.map((event: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                <div className="flex-1">
                                  <p className="font-semibold">{event.status}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {event.location} • {new Date(event.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Totals */}
                    <div>
                      <h3 className="font-semibold mb-3">Order Summary</h3>
                      <div className="p-4 bg-background rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-semibold">
                            ${(order.totalAmount * 0.85).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-semibold">
                            ${(order.totalAmount * 0.05).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="font-semibold">
                            ${(order.totalAmount * 0.10).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {order.status === 'delivered' && (
                        <Button
                          onClick={() => router.push(`/books/${order.items[0].bookId}`)}
                        >
                          Write a Review
                        </Button>
                      )}
                      {order.status === 'pending' && (
                        <Button variant="destructive">
                          Cancel Order
                        </Button>
                      )}
                      <Button variant="outline">
                        Download Invoice
                      </Button>
                      <Button variant="outline">
                        Contact Support
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
