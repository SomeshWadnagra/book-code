'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { bookService } from '@/lib/api';
import { 
  Loader, 
  BookOpen, 
  Brain, 
  Rocket, 
  Search as SearchIcon,
  Heart,
  Skull,
  Globe,
  Lightbulb,
  Cpu,
  Trophy
} from 'lucide-react';

interface CategoryInfo {
  name: string;
  description: string;
  icon: any;
  color: string;
  count: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryConfig = [
    {
      name: 'Fiction',
      description: 'Immerse yourself in captivating stories and literary masterpieces',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      name: 'Non-Fiction',
      description: 'Real stories, facts, and knowledge from the world around us',
      icon: Globe,
      color: 'bg-green-100 text-green-700',
    },
    {
      name: 'Science Fiction',
      description: 'Explore future worlds, space adventures, and speculative technology',
      icon: Rocket,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      name: 'Mystery',
      description: 'Thrilling tales of suspense, crime, and detective work',
      icon: SearchIcon,
      color: 'bg-gray-100 text-gray-700',
    },
    {
      name: 'Romance',
      description: 'Heartwarming love stories and emotional journeys',
      icon: Heart,
      color: 'bg-pink-100 text-pink-700',
    },
    {
      name: 'Biography',
      description: 'True stories of remarkable lives and historical figures',
      icon: Trophy,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      name: 'History',
      description: 'Discover the past through comprehensive historical accounts',
      icon: Skull,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      name: 'Science',
      description: 'Explore the wonders of science and natural phenomena',
      icon: Brain,
      color: 'bg-teal-100 text-teal-700',
    },
    {
      name: 'Technology',
      description: 'Stay updated with tech innovations and digital transformation',
      icon: Cpu,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      name: 'Self-Help',
      description: 'Personal development, mindfulness, and life improvement',
      icon: Lightbulb,
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      setLoading(true);

      // Fetch all books to count by category
      const response = await bookService.getBooks(1, 100);
      const allBooks = response.data.data;

      // Count books per category
      const counts: { [key: string]: number } = {};
      allBooks.forEach(book => {
        counts[book.category] = (counts[book.category] || 0) + 1;
      });

      // Merge counts with config
      const categoriesWithCounts = categoryConfig.map(cat => ({
        ...cat,
        count: counts[cat.name] || 0,
      }));

      setCategories(categoriesWithCounts);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Set categories without counts
      setCategories(categoryConfig.map(cat => ({ ...cat, count: 0 })));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/search?category=${encodeURIComponent(categoryName)}`);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse by Category
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore our diverse collection of books across all genres
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin" size={32} />
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.name}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${category.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                              {category.name}
                            </h3>
                            <Badge variant="secondary">
                              {category.count}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary mb-1">
                    {categories.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary mb-1">
                    {categories.reduce((sum, cat) => sum + cat.count, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Books</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary mb-1">
                    {Math.round(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg per Category</p>
                </CardContent>
              </Card>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => router.push('/browse')} size="lg">
                Browse All Books
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/bestsellers')}
                size="lg"
              >
                View Bestsellers
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/recommendations')}
                size="lg"
              >
                Get Recommendations
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
