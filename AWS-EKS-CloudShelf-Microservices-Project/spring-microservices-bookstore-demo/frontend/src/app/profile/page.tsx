'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Address } from '@/types';
import { userService } from '@/lib/api';
import { 
  Loader, 
  User as UserIcon, 
  MapPin, 
  Heart, 
  Settings,
  Edit2,
  Trash2,
  Plus,
  Save,
  X
} from 'lucide-react';

type Tab = 'profile' | 'addresses' | 'preferences';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User data
  const [user, setUser] = useState<User | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    avatar: '',
  });

  // Address data
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    _id: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  // Preferences data
  const [preferences, setPreferences] = useState({
    favoriteCategories: [] as string[],
    notifications: true,
    newsletter: true,
  });

  const allCategories = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Mystery',
    'Romance',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Self-Help',
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getProfile('user-123');
      const userData = response.data;

      setUser(userData);
      setProfileForm({
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || '',
      });
      setAddresses(userData.addresses || []);
      setPreferences(userData.preferences || {
        favoriteCategories: [],
        notifications: true,
        newsletter: true,
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await userService.updateProfile('user-123', {
        name: profileForm.name,
        email: profileForm.email,
        avatar: profileForm.avatar,
      });
      
      // Refresh user data
      await loadUserData();
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    setAddingAddress(true);
    setEditingAddress(null);
    setAddressForm({
      _id: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      isDefault: false,
    });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address._id);
    setAddingAddress(false);
    setAddressForm(address);
  };

  const handleSaveAddress = async () => {
    try {
      setSaving(true);
      
      if (addingAddress) {
        // Add new address
        const newAddresses = [...addresses, { ...addressForm, _id: Date.now().toString() }];
        await userService.updateProfile('user-123', { addresses: newAddresses });
        setAddresses(newAddresses);
      } else if (editingAddress) {
        // Update existing address
        const updatedAddresses = addresses.map(addr =>
          addr._id === editingAddress ? addressForm : addr
        );
        await userService.updateProfile('user-123', { addresses: updatedAddresses });
        setAddresses(updatedAddresses);
      }

      // Reset form
      setAddingAddress(false);
      setEditingAddress(null);
      setAddressForm({
        _id: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        isDefault: false,
      });
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const updatedAddresses = addresses.filter(addr => addr._id !== addressId);
      await userService.updateProfile('user-123', { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await userService.updateProfile('user-123', { preferences });
      await loadUserData();
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.includes(category)
        ? prev.favoriteCategories.filter(c => c !== category)
        : [...prev.favoriteCategories, category],
    }));
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

  if (error || !user) {
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
              <p className="text-destructive mb-4">{error || 'User not found'}</p>
              <Button onClick={loadUserData}>Try Again</Button>
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
        wishlistCount={user.wishlist?.length || 0}
        onSearch={(q) => router.push(`/search?q=${q}`)}
        isAuthenticated={true}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-10 h-10 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserIcon className="inline mr-2" size={20} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'addresses'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapPin className="inline mr-2" size={20} />
            Addresses
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'preferences'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="inline mr-2" size={20} />
            Preferences
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Avatar URL (optional)</label>
                  <Input
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader className="animate-spin mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">{user.wishlist?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Wishlist Items</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">{addresses.length}</p>
                  <p className="text-sm text-muted-foreground">Saved Addresses</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">{preferences.favoriteCategories.length}</p>
                  <p className="text-sm text-muted-foreground">Favorite Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Saved Addresses</CardTitle>
                <Button onClick={handleAddAddress}>
                  <Plus className="mr-2" size={16} />
                  Add New Address
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address Form (Add/Edit) */}
                {(addingAddress || editingAddress) && (
                  <Card className="bg-muted/30">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-semibold">
                        {addingAddress ? 'Add New Address' : 'Edit Address'}
                      </h3>
                      <Input
                        placeholder="Street Address"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="City"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        />
                        <Input
                          placeholder="State"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Postal Code"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        />
                        <Input
                          placeholder="Country"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-semibold">Set as default address</span>
                      </label>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveAddress} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader className="animate-spin mr-2" size={16} />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2" size={16} />
                              Save Address
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAddingAddress(false);
                            setEditingAddress(null);
                          }}
                        >
                          <X className="mr-2" size={16} />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Address List */}
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No saved addresses yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <Card key={address._id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin size={16} className="text-primary" />
                                {address.isDefault && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                              </div>
                              <p className="font-semibold">{address.street}</p>
                              <p className="text-muted-foreground">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-muted-foreground">{address.country}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAddress(address)}
                              >
                                <Edit2 size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAddress(address._id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Favorite Categories */}
              <div>
                <h3 className="font-semibold mb-3">Favorite Categories</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select your favorite book categories to get personalized recommendations
                </p>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-4 py-2 rounded-full border-2 transition-colors ${
                        preferences.favoriteCategories.includes(category)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted hover:border-muted-foreground'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Settings */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-muted/30 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-semibold">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your orders and account
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-muted/30 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-semibold">Newsletter Subscription</p>
                      <p className="text-sm text-muted-foreground">
                        Get book recommendations, deals, and updates
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.newsletter}
                      onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSavePreferences} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader className="animate-spin mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/wishlist')}>
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">View Wishlist</h3>
              <p className="text-sm text-muted-foreground">
                {user.wishlist?.length || 0} saved items
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/orders')}>
            <CardContent className="p-6 text-center">
              <Settings className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Order History</h3>
              <p className="text-sm text-muted-foreground">
                View past orders
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/')}>
            <CardContent className="p-6 text-center">
              <UserIcon className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Browse Books</h3>
              <p className="text-sm text-muted-foreground">
                Discover new reads
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
