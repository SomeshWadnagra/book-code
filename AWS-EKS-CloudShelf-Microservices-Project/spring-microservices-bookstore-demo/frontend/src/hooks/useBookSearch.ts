// ===========================================
// hooks/useBookSearch.ts - Smart Book Search Hook
// ===========================================
//
// This hook encapsulates the search logic including:
// - Fuzzy matching with Levenshtein distance
// - Debounced API calls
// - Filter/sort capabilities
// - Works with both live API and dummy data
// ===========================================

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Book, SearchFilters, PaginatedResponse } from '@/types';
import { bookService } from '@/lib/api';

// ===========================================
// Types
// ===========================================

export interface UseBookSearchOptions {
  /** Initial search query */
  initialQuery?: string;
  /** Initial filters */
  initialFilters?: SearchFilters;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Enable client-side fuzzy matching (default: true) */
  enableFuzzyMatch?: boolean;
  /** Similarity threshold for fuzzy matching (0-1, default: 0.6) */
  fuzzyThreshold?: number;
}

export interface UseBookSearchResult {
  /** Current search results */
  results: Book[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Current search query */
  query: string;
  /** Set search query (debounced) */
  setQuery: (query: string) => void;
  /** Current filters */
  filters: SearchFilters;
  /** Update filters */
  setFilters: (filters: SearchFilters) => void;
  /** Total results count */
  totalResults: number;
  /** Whether there are more results */
  hasMore: boolean;
  /** Trigger a manual search */
  search: () => Promise<void>;
  /** Clear all results and query */
  clear: () => void;
}

// ===========================================
// Levenshtein Distance Algorithm
// ===========================================

/**
 * Calculate the Levenshtein distance between two strings
 * This measures how many single-character edits are needed to transform one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create a matrix to store distances
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Fill in the rest of the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0 to 1)
 * 1 = identical, 0 = completely different
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Check if two strings are similar enough based on threshold
 */
function isFuzzyMatch(query: string, target: string, threshold: number): boolean {
  return calculateSimilarity(query, target) >= threshold;
}

// ===========================================
// Relevance Scoring with Strict Threshold
// ===========================================

interface ScoredBook {
  book: Book;
  score: number;
  maxSimilarity: number; // Track the best match quality
}

/**
 * STRICT RELEVANCE THRESHOLD
 * 
 * This is the minimum similarity percentage required for a book to be included.
 * - 0.4 (40%) = Allows reasonable typos (e.g., "pragmtic" → "pragmatic")
 * - 0.5 (50%) = Moderate strictness
 * - 0.6 (60%) = Strict matching
 * 
 * If NO word in the query matches ANY word in the book with at least this
 * similarity, the book is DISCARDED entirely.
 */
const MINIMUM_MATCH_QUALITY = 0.4; // 40% minimum match required

/**
 * MINIMUM SCORE THRESHOLD
 * 
 * Even if a fuzzy match passes, the overall relevance score must exceed
 * this value. This filters out books that technically "match" but are
 * clearly irrelevant (e.g., matching a single common word).
 */
const MINIMUM_RELEVANCE_SCORE = 15;

/**
 * Calculate relevance score for ranking search results
 * Returns both a score AND the maximum similarity found
 * 
 * @returns { score: number, maxSimilarity: number }
 */
function calculateRelevanceScoreStrict(
  book: Book,
  query: string,
  threshold: number
): { score: number; maxSimilarity: number; hasDirectMatch: boolean } {
  const lowerQuery = query.toLowerCase().trim();
  let score = 0;
  let maxSimilarity = 0;
  let hasDirectMatch = false;

  // =============================================
  // PHASE 1: Check for direct substring matches (highest confidence)
  // =============================================
  
  if (book.title.toLowerCase().includes(lowerQuery)) {
    score += 100;
    maxSimilarity = 1.0;
    hasDirectMatch = true;
  }
  if (book.author.toLowerCase().includes(lowerQuery)) {
    score += 80;
    maxSimilarity = 1.0;
    hasDirectMatch = true;
  }
  if (book.description.toLowerCase().includes(lowerQuery)) {
    score += 30;
    maxSimilarity = Math.max(maxSimilarity, 0.8);
    hasDirectMatch = true;
  }

  // Bonus for matches at the beginning of title/author
  if (book.title.toLowerCase().startsWith(lowerQuery)) {
    score += 50;
    maxSimilarity = 1.0;
    hasDirectMatch = true;
  }
  if (book.author.toLowerCase().startsWith(lowerQuery)) {
    score += 40;
    maxSimilarity = 1.0;
    hasDirectMatch = true;
  }

  // =============================================
  // PHASE 2: Word-by-word fuzzy matching
  // =============================================
  
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1); // Ignore single chars
  const titleWords = book.title.toLowerCase().split(/\s+/);
  const authorWords = book.author.toLowerCase().split(/\s+/);

  queryWords.forEach((queryWord) => {
    let bestWordMatch = 0;

    // Check title words
    titleWords.forEach((titleWord) => {
      const similarity = calculateSimilarity(queryWord, titleWord);
      bestWordMatch = Math.max(bestWordMatch, similarity);
      if (similarity >= threshold) {
        score += similarity * 40;
      }
    });

    // Check author words
    authorWords.forEach((authorWord) => {
      const similarity = calculateSimilarity(queryWord, authorWord);
      bestWordMatch = Math.max(bestWordMatch, similarity);
      if (similarity >= threshold) {
        score += similarity * 30;
      }
    });

    // Check tags
    if (book.tags) {
      book.tags.forEach((tag) => {
        const similarity = calculateSimilarity(queryWord, tag.toLowerCase());
        bestWordMatch = Math.max(bestWordMatch, similarity);
        if (similarity >= threshold) {
          score += similarity * 20;
        }
      });
    }

    // Check category
    if (book.category) {
      const similarity = calculateSimilarity(queryWord, book.category.toLowerCase());
      bestWordMatch = Math.max(bestWordMatch, similarity);
      if (similarity >= threshold) {
        score += similarity * 15;
      }
    }

    // Track the overall best match
    maxSimilarity = Math.max(maxSimilarity, bestWordMatch);
  });

  // =============================================
  // PHASE 3: Small bonus for popular/highly-rated books
  // (Only if there's already some match)
  // =============================================
  
  if (score > 0) {
    score += book.rating * 2;
    score += Math.log(book.reviewCount + 1) * 1;
  }

  return { score, maxSimilarity, hasDirectMatch };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use calculateRelevanceScoreStrict instead
 */
function calculateRelevanceScore(
  book: Book,
  query: string,
  threshold: number
): number {
  return calculateRelevanceScoreStrict(book, query, threshold).score;
}

// ===========================================
// Filter and Sort Logic
// ===========================================

function applyFilters(books: Book[], filters: SearchFilters): Book[] {
  let filtered = [...books];

  if (filters.category) {
    filtered = filtered.filter(
      (book) => book.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter(
      (book) => book.price >= min && book.price <= max
    );
  }

  if (filters.rating) {
    filtered = filtered.filter((book) => book.rating >= filters.rating!);
  }

  if (filters.inStockOnly) {
    filtered = filtered.filter((book) => book.inStock);
  }

  return filtered;
}

function applySorting(books: Book[], sortBy?: SearchFilters['sortBy']): Book[] {
  if (!sortBy || sortBy === 'relevance') {
    return books; // Already sorted by relevance score
  }

  const sorted = [...books];

  switch (sortBy) {
    case 'price':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      sorted.sort((a, b) => {
        const dateA = new Date(a.publishedDate || 0);
        const dateB = new Date(b.publishedDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
      break;
  }

  return sorted;
}

// ===========================================
// Debounce Utility
// ===========================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ===========================================
// Main Hook
// ===========================================

export function useBookSearch(options: UseBookSearchOptions = {}): UseBookSearchResult {
  const {
    initialQuery = '',
    initialFilters = {},
    debounceMs = 300,
    enableFuzzyMatch = true,
    fuzzyThreshold = 0.6,
  } = options;

  // State
  const [query, setQueryInternal] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced query for API calls
  const debouncedQuery = useDebounce(query, debounceMs);

  /**
   * Perform the actual search
   */
  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: SearchFilters) => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Don't search for empty queries
      if (!searchQuery.trim()) {
        setResults([]);
        setTotalResults(0);
        setHasMore(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        // Fetch from API (or dummy data)
        const response = await bookService.searchBooks("", { ...searchFilters, size: 1000, limit: 1000 });
        
        if (!response.data) {
          setResults([]);
          setTotalResults(0);
          setHasMore(false);
          return;
        }

        let books = response.data.data;

        // =============================================
        // STRICT RELEVANCE FILTERING
        // =============================================
        if (enableFuzzyMatch && books.length > 0) {
          const scoredBooks: ScoredBook[] = books.map((book) => {
            const { score, maxSimilarity, hasDirectMatch } = calculateRelevanceScoreStrict(
              book,
              searchQuery,
              fuzzyThreshold
            );
            return { book, score, maxSimilarity };
          });

          // STRICT FILTER: Discard books that don't meet BOTH criteria:
          // 1. At least one word must match with >= MINIMUM_MATCH_QUALITY similarity
          // 2. Overall relevance score must be >= MINIMUM_RELEVANCE_SCORE
          books = scoredBooks
            .filter((item) => {
              const meetsQualityThreshold = item.maxSimilarity >= MINIMUM_MATCH_QUALITY;
              const meetsScoreThreshold = item.score >= MINIMUM_RELEVANCE_SCORE;
              
              // Debug logging (remove in production)
              if (process.env.NODE_ENV === 'development') {
                console.log(
                  `[Search] "${item.book.title}" - Score: ${item.score.toFixed(1)}, ` +
                  `MaxSim: ${(item.maxSimilarity * 100).toFixed(0)}%, ` +
                  `Pass: ${meetsQualityThreshold && meetsScoreThreshold}`
                );
              }

              return meetsQualityThreshold && meetsScoreThreshold;
            })
            .sort((a, b) => b.score - a.score)
            .map((item) => item.book);

          // NOTE: We intentionally do NOT fall back to substring search
          // If the strict matching returns nothing, we return an empty array
          // This prevents "zxczxc" from returning random "closest" books
        }

        // Apply additional filters (category, price, etc.)
        books = applyFilters(books, searchFilters);

        // Apply sorting
        books = applySorting(books, searchFilters.sortBy);

        setResults(books);
        setTotalResults(books.length);
        setHasMore(response.data.hasMore);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Ignore abort errors
          return;
        }
        console.error('[useBookSearch] Search failed:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [enableFuzzyMatch, fuzzyThreshold]
  );

  /**
   * Trigger search when debounced query or filters change
   */
  useEffect(() => {
    performSearch(debouncedQuery, filters);
  }, [debouncedQuery, filters, performSearch]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Set query with validation
   */
  const setQuery = useCallback((newQuery: string) => {
    setQueryInternal(newQuery);
  }, []);

  /**
   * Manual search trigger
   */
  const search = useCallback(async () => {
    await performSearch(query, filters);
  }, [query, filters, performSearch]);

  /**
   * Clear results and query
   */
  const clear = useCallback(() => {
    setQueryInternal('');
    setResults([]);
    setTotalResults(0);
    setHasMore(false);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    query,
    setQuery,
    filters,
    setFilters,
    totalResults,
    hasMore,
    search,
    clear,
  };
}

// ===========================================
// Additional Exports for Direct Usage
// ===========================================

export {
  levenshteinDistance,
  calculateSimilarity,
  isFuzzyMatch,
  calculateRelevanceScore,
  calculateRelevanceScoreStrict,
  applyFilters,
  applySorting,
  MINIMUM_MATCH_QUALITY,
  MINIMUM_RELEVANCE_SCORE,
};

// Default export
export default useBookSearch;