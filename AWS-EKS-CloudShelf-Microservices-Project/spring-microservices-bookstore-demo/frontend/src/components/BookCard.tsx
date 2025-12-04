'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/types';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface BookCardProps {
  book: Book;
  onAddToCart: (book: Book) => void;
  onAddToWishlist: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onAddToCart,
  onAddToWishlist,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(book);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist(book);
  };

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Cover Image */}
      <div className="relative overflow-hidden bg-muted h-64 w-full">
        <Link href={`/books/${book._id}`}>
          <Image
            src={book.coverImage || 'https://via.placeholder.com/200x300'}
            alt={book.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            unoptimized={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {!book.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}

        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <Heart
            size={20}
            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Book Info */}
      <CardContent className="flex-1 pt-4">
        <Link href={`/books/${book._id}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {book.title}
          </h3>
          <CardDescription className="mb-2">{book.author}</CardDescription>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.round(book.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({book.reviewCount})
          </span>
        </div>

        {/* Category & Price */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="text-xs">
            {book.category}
          </Badge>
          <span className="text-xl font-bold text-primary">
            {formatPrice(book.price)}
          </span>
        </div>

        {/* Stock Status */}
        {book.inStock && book.stockCount < 5 && (
          <p className="text-xs text-orange-600 mb-2">
            Only {book.stockCount} left in stock!
          </p>
        )}
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!book.inStock || isAdding}
          className="w-full gap-2"
        >
          <ShoppingCart size={18} />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};
