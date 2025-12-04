'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Heart, Menu, X, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onSearch: (query: string) => void;
  isAuthenticated: boolean;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  onSearch,
  isAuthenticated,
  userName,
}) => {
  const router = useRouter();
  const { logout } = useAuth(); // Get logout from AuthContext
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    setShowUserMenu(false);
    router.push('/'); // Redirect to home
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between h-16">
        {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <img 
              src="/logo.svg" 
              alt="BookVerse Logo" 
              className="w-8 h-8"
            />
            <span className="hidden sm:inline">BookVerse</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 mx-8 relative"
          >
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search books by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Right Navigation Icons */}
          <div className="flex items-center gap-4">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {wishlistCount}
                </Badge>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>

            {/* User Account */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
                    {userName || 'User'}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b">
                        <p className="text-sm font-semibold">{userName || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {localStorage.getItem('userEmail') || 'user@bookverse.com'}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                      >
                        <UserCircle size={16} />
                        <span className="text-sm">My Profile</span>
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                      >
                        <ShoppingCart size={16} />
                        <span className="text-sm">My Orders</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                      >
                        <Heart size={16} />
                        <span className="text-sm">My Wishlist</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-destructive border-t"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline">
                  <User size={18} />
                  <span className="hidden sm:inline ml-2">Sign In</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobileMenuOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>
        )}

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8 py-4 border-t">
          <Link
            href="/browse"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/bestsellers"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Bestsellers
          </Link>
          <Link
            href="/recommendations"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Recommendations
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Categories
          </Link>
        </nav>
      </div>
    </header>
  );
};
