// ===========================================
// lib/api.ts - CloudShelf/BookVerse API Client
// ===========================================
// 
// This is the "bridge" between the Next.js frontend and the
// Spring Boot microservices backend running on Minikube.
//
// Key Features:
// - GraphQL client for Book Service
// - REST client for Author/Order services
// - Automatic fallback to dummy data when USE_DUMMY_DATA=true
// - Type-safe transformations between backend and frontend models
// ===========================================

import {
  Book,
  BackendBookResponse,
  BackendAuthorResponse,
  BackendOrderResponse,
  BackendReviewResponse,
  BackendUserProfileResponse,
  transformBackendBook,
  transformBackendAuthor,
  transformBackendReview,
  transformBackendUserProfile,
  GraphQLResponse,
  GetAllBooksResponse,
  CreateBookResponse,
  DeleteBookResponse,
  BookInput,
  OrderInput,
  AuthorInput,
  Author,
  Review,
  User,
  SearchFilters,
  PaginatedResponse,
} from '@/types';

import {
  getDummyBooks,
  searchDummyBooks,
  getDummyBooksByCategory,
  getDummyBookById,
  DUMMY_BOOKS,
} from './dummyData';

import { stringToNumberId } from './utils';
import { fetchAuthSession } from 'aws-amplify/auth';

// ===========================================
// Configuration
// ===========================================

// Helper to detect if we are running on the Server (Node.js) or Browser
const isServer = typeof window === 'undefined';

// 1. Get the Backend IP (Server-Side Only)
const SERVER_HOST = process.env.MINIKUBE_API_HOST || 'http://127.0.0.1:40029';

// 2. Determine the GraphQL Endpoint
// - Server: Talk directly to Minikube (bypassing the Proxy to avoid "Relative URL" errors)
// - Browser: Talk to the Next.js Proxy (to avoid CORS errors)
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_GATEWAY_URL || '/api/graphql';

// 3. Determine the REST Base URL
// Same logic as above
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const USE_DUMMY_DATA = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true';

// Debug logging
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

function logDebug(message: string, data?: unknown) {
  if (DEBUG) {
    const env = isServer ? '[SERVER]' : '[CLIENT]';
    console.log(`${env} [API] ${message}`, data || '');
  }
}

// ===========================================
// GraphQL Client
// ===========================================

interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, unknown>;
}

// Helper to get the current JWT token securely from AWS
async function getAuthToken(): Promise<string | undefined> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (err) {
    return undefined;
  }
}

async function graphqlFetch<T>(options: GraphQLRequestOptions): Promise<GraphQLResponse<T>> {
  const { query, variables } = options;
  const token = await getAuthToken();
  
  logDebug(`GraphQL Request to ${GRAPHQL_ENDPOINT}`, { query, variables });
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Attaching token
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: GraphQLResponse<T> = await response.json();
    
    logDebug('GraphQL Response', data);
    
    if (data.errors && data.errors.length > 0) {
      console.error('[API] GraphQL Errors:', data.errors);
    }
    
    return data;
  } catch (error) {
    console.error('[API] GraphQL fetch failed:', error);
    throw error;
  }
}

// ===========================================
// REST Client
// ===========================================

async function restFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();
  logDebug(`REST Request to ${url}`, options);
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  logDebug('REST Response', data);
  return data;
}

// ===========================================
// Book Service (GraphQL)
// ===========================================

export const bookService = {
  /**
   * Get all books from the backend
   * Falls back to dummy data if USE_DUMMY_DATA is true or if API fails
   */
  getBooks: async (page = 1, limit = 12): Promise<{ data: PaginatedResponse<Book> }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for getBooks');
      const dummyData = getDummyBooks(page, limit);
      return { data: dummyData };
    }

    try {
      const response = await graphqlFetch<GetAllBooksResponse>({
        query: `
          query GetAllBooks {
            getAllBooks {
              id
              name
              description
              price
            }
          }
        `,
      });

      if (response.data?.getAllBooks) {
        const books = response.data.getAllBooks.map(transformBackendBook);
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedBooks = books.slice(start, end);

        return {
          data: {
            data: paginatedBooks,
            total: books.length,
            page,
            limit,
            hasMore: end < books.length,
          },
        };
      }

      // Fallback to dummy data if no books returned
      logDebug('No books from API, falling back to dummy data');
      return { data: getDummyBooks(page, limit) };
    } catch (error) {
      console.warn('[API] getBooks failed, falling back to dummy data:', error);
      return { data: getDummyBooks(page, limit) };
    }
  },

  /**
   * Get a single book by ID
   */
  getBook: async (bookId: string): Promise<{ data: Book | undefined }> => {
    // Force log to verify
    console.log(`\n[!!! DIAGNOSTIC] Fetching Book ID: ${bookId}`);
    console.log(`[!!! DIAGNOSTIC] Environment: ${typeof window === 'undefined' ? 'SERVER (Node)' : 'CLIENT (Browser)'}`);
    console.log(`[!!! DIAGNOSTIC] Target URL: ${GRAPHQL_ENDPOINT}`);

    if (USE_DUMMY_DATA) {
      const book = getDummyBookById(bookId);
      return { data: book };
    }

    try {
      const response = await graphqlFetch<GetAllBooksResponse>({
        query: `
          query GetAllBooks {
            getAllBooks {
              id
              name
              description
              price
            }
          }
        `,
      });

      if (response.data?.getAllBooks) {
        const backendBook = response.data.getAllBooks.find(b => b.id === bookId);
        
        if (backendBook) {
          console.log(`[!!! DIAGNOSTIC] ✅ Found book: ${backendBook.name}`);
          return { data: transformBackendBook(backendBook) };
        } else {
          console.error(`[!!! DIAGNOSTIC] ❌ Book ID not found in list. Available IDs:`, response.data.getAllBooks.map(b => b.id));
        }
      }
      
      return { data: getDummyBookById(bookId) };
    } catch (error) {
      console.error('[!!! DIAGNOSTIC] UNKNOWN error:', error);
      return { data: getDummyBookById(bookId) };
    }
  },

  /**
   * Alias for getBook (consistency)
   */
  getBookById: async (bookId: string) => {
    return bookService.getBook(bookId);
  },

  /**
   * Create a new book
   */
  createBook: async (book: BookInput): Promise<{ data: Book | null }> => {
    if (USE_DUMMY_DATA) {
      console.warn('[API] createBook not available in dummy data mode');
      return { data: null };
    }

    try {
      const response = await graphqlFetch<CreateBookResponse>({
        query: `
          mutation CreateBook($bookRequest: BookRequest!) {
            createBook(bookRequest: $bookRequest) {
              id
              name
              description
              price
            }
          }
        `,
        variables: {
          bookRequest: {
            name: book.name,
            description: book.description,
            price: book.price,
          },
        },
      });

      if (response.data?.createBook) {
        return { data: transformBackendBook(response.data.createBook) };
      }

      return { data: null };
    } catch (error) {
      console.error('[API] createBook failed:', error);
      return { data: null };
    }
  },

  /**
   * Delete a book by ID
   */
  deleteBook: async (bookId: string): Promise<{ data: boolean }> => {
    if (USE_DUMMY_DATA) {
      console.warn('[API] deleteBook not available in dummy data mode');
      return { data: false };
    }

    try {
      const response = await graphqlFetch<DeleteBookResponse>({
        query: `
          mutation DeleteBook($id: ID!) {
            deleteBook(id: $id)
          }
        `,
        variables: { id: bookId },
      });

      return { data: response.data?.deleteBook ?? false };
    } catch (error) {
      console.error('[API] deleteBook failed:', error);
      return { data: false };
    }
  },

  /**
   * Search books
   */
  searchBooks: async (
    query: string,
    filters?: SearchFilters
  ): Promise<{ data: PaginatedResponse<Book> }> => {
    if (USE_DUMMY_DATA) {
      let results = searchDummyBooks(query);
      
      // Apply filters
      if (filters?.category) {
        results = results.filter(book => book.category === filters.category);
      }
      if (filters?.priceRange) {
        const [min, max] = filters.priceRange;
        results = results.filter(book => book.price >= min && book.price <= max);
      }
      if (filters?.rating) {
        results = results.filter(book => book.rating >= filters.rating);
      }
      if (filters?.inStockOnly) {
        results = results.filter(book => book.inStock);
      }
      
      // Apply sorting
      if (filters?.sortBy === 'price') {
        results.sort((a, b) => a.price - b.price);
      } else if (filters?.sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      }

      return {
        data: {
          data: results,
          total: results.length,
          page: 1,
          limit: results.length,
          hasMore: false,
        },
      };
    }

    try {
      // Backend doesn't have search, so we fetch all and filter client-side
      const response = await graphqlFetch<GetAllBooksResponse>({
        query: `
          query GetAllBooks {
            getAllBooks {
              id
              name
              description
              price
            }
          }
        `,
      });

      if (response.data?.getAllBooks) {
        const books = response.data.getAllBooks.map(transformBackendBook);
        
        // Client-side search (backend books have limited fields)
        const lowerQuery = query.toLowerCase();
        const results = books.filter(book =>
          book.title.toLowerCase().includes(lowerQuery) ||
          book.description.toLowerCase().includes(lowerQuery)
        );

        return {
          data: {
            data: results,
            total: results.length,
            page: 1,
            limit: results.length,
            hasMore: false,
          },
        };
      }

      // Fallback to dummy search
      const results = searchDummyBooks(query);
      return {
        data: {
          data: results,
          total: results.length,
          page: 1,
          limit: results.length,
          hasMore: false,
        },
      };
    } catch (error) {
      console.warn('[API] searchBooks failed, falling back to dummy data:', error);
      const results = searchDummyBooks(query);
      return {
        data: {
          data: results,
          total: results.length,
          page: 1,
          limit: results.length,
          hasMore: false,
        },
      };
    }
  },

  /**
   * Get books by category
   */
  getBooksByCategory: async (category: string): Promise<{ data: { data: Book[]; total: number } }> => {
    if (USE_DUMMY_DATA) {
      const results = getDummyBooksByCategory(category);
      return { data: { data: results, total: results.length } };
    }

    // Backend doesn't have category support
    const results = getDummyBooksByCategory(category);
    return { data: { data: results, total: results.length } };
  },
};

// ===========================================
// Author Service (REST)
// ===========================================

export const authorService = {
  /**
   * Get all authors
   */
  getAllAuthors: async (): Promise<Author[]> => {
    if (USE_DUMMY_DATA) {
      return [
        { id: '1', name: 'Erich Gamma', birthDate: '1961-03-13' },
        { id: '2', name: 'Andrew Hunt', birthDate: '1964-02-19' },
      ];
    }

    try {
      const response = await restFetch<BackendAuthorResponse[]>('/authors');
      return response.map(transformBackendAuthor);
    } catch (error) {
      console.warn('[API] getAllAuthors failed:', error);
      return [];
    }
  },

  /**
   * Create a new author
   */
  createAuthor: async (author: AuthorInput): Promise<Author | null> => {
    if (USE_DUMMY_DATA) {
      console.warn('[API] createAuthor not available in dummy data mode');
      return null;
    }

    try {
      const response = await restFetch<BackendAuthorResponse>('/authors', {
        method: 'POST',
        body: JSON.stringify(author),
      });
      return transformBackendAuthor(response);
    } catch (error) {
      console.error('[API] createAuthor failed:', error);
      return null;
    }
  },

  /**
   * Delete an author by ID
   */
  deleteAuthor: async (id: string): Promise<boolean> => {
    if (USE_DUMMY_DATA) {
      console.warn('[API] deleteAuthor not available in dummy data mode');
      return false;
    }

    try {
      await restFetch(`/authors/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('[API] deleteAuthor failed:', error);
      return false;
    }
  },
};

// ===========================================
// Order Service (REST)
// ===========================================

export const orderService = {
  /**
   * Place a new order
   */
  placeOrder: async (order: OrderInput): Promise<{ data: BackendOrderResponse | null }> => {
    if (USE_DUMMY_DATA) {
      return {
        data: {
          id: Date.now(),
          orderNumber: `ORD-${Date.now()}`,
          orderLineItemsDtoList: order.orderLineItemsDtoList,
        },
      };
    }

    try {
      const response = await restFetch<BackendOrderResponse>('/order', {
        method: 'POST',
        body: JSON.stringify(order),
      });
      return { data: response };
    } catch (error) {
      console.error('[API] placeOrder failed:', error);
      return { data: null };
    }
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: string): Promise<{ data: BackendOrderResponse | null }> => {
    if (USE_DUMMY_DATA) {
      return { data: null };
    }

    try {
      const response = await restFetch<BackendOrderResponse>(`/order/${id}`);
      return { data: response };
    } catch (error) {
      console.error('[API] getOrderById failed:', error);
      return { data: null };
    }
  },
};

// ===========================================
// Cart Service (Local/Dummy)
// ===========================================

export const cartService = {
  getCart: async (userId: string) => {
    if (USE_DUMMY_DATA) {
      const books = getDummyBooks(1, 3).data;
      return {
        data: {
          userId,
          items: books.map((book, idx) => ({
            bookId: book._id,
            book,
            quantity: idx + 1,
            price: book.price,
            subtotal: book.price * (idx + 1),
          })),
          totalItems: books.length,
          totalPrice: books.reduce((sum, book, idx) => sum + book.price * (idx + 1), 0),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
    // Cart service not implemented in backend
    return {
      data: {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  },

  addToCart: async (_userId: string, _bookId: string, _qty: number) => {
    return { data: { success: true } };
  },

  updateCartItem: async (_userId: string, _bookId: string, _qty: number) => {
    return { data: { success: true } };
  },

  removeCartItem: async (_userId: string, _bookId: string) => {
    return { data: { success: true } };
  },

  removeFromCart: async (userId: string, bookId: string) => {
    return cartService.removeCartItem(userId, bookId);
  },

  checkout: async (_userId: string) => {
    return { data: { orderId: `ORD-${Date.now()}` } };
  },
};

// ===========================================
// Review Service (Dummy)
// ===========================================

// ===========================================
// Review Service (REST - Hisham's reviews-service)
// ===========================================
// Endpoint: /api/proxy/reviews (proxied to reviews-service)
// 
// Backend Schema (PostgreSQL):
// - id: BIGSERIAL PK
// - book_id: BIGINT (⚠️ Should be string to match MongoDB Book._id)
// - user_id: BIGINT
// - rating: INT (1-5)
// - comment: TEXT
// - created_at: TIMESTAMP
// ===========================================

export const reviewService = {
  /**
   * Get all reviews for a specific book
   * Endpoint: GET /api/proxy/reviews/book/{bookId}
   */
  getBookReviews: async (bookId: string): Promise<{ data: Review[] }> => {
    // Dummy data for development/fallback
    const dummyReviews: Review[] = [
      {
        _id: '1',
        bookId,
        userId: 'user1',
        userName: 'John Smith',
        rating: 5,
        text: 'Absolutely loved this book! Could not put it down.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 12,
      },
      {
        _id: '2',
        bookId,
        userId: 'user2',
        userName: 'Sarah Johnson',
        rating: 4,
        text: 'Great read with compelling content. Highly recommend!',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 8,
      },
    ];

    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for getBookReviews');
      return { data: dummyReviews };
    }

    try {
      // ⚠️ Note: Backend expects bookId as BIGINT (Long)
      // If bookId is a MongoDB ObjectId string, this may fail
      // You may need to maintain a mapping or use a numeric ID
      const numericId = stringToNumberId(bookId);
      const backendReviews = await restFetch<BackendReviewResponse[]>(
        `/proxy/reviews/book/${numericId}`
      );

      // Transform backend responses to frontend format
      const reviews = backendReviews.map((review) => 
        transformBackendReview(review, 'Anonymous User')
      );

      logDebug(`Fetched ${reviews.length} reviews for book ${bookId}`);
      return { data: reviews };
    } catch (error) {
      console.warn('[API] getBookReviews failed, falling back to dummy data:', error);
      return { data: dummyReviews };
    }
  },

  /**
   * Get average rating for a book
   * Endpoint: GET /api/proxy/reviews/book/{bookId}/average-rating
   */
  getBookRatings: async (bookId: string) => {
    const dummyRating = {
      bookId,
      averageRating: 4.5,
      totalRatings: 127,
      distribution: { 5: 80, 4: 30, 3: 12, 2: 3, 1: 2 },
    };

    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for getBookRatings');
      return { data: dummyRating };
    }

    try {
      const response = await restFetch<{ bookId: number; averageRating: number }>(
        `/proxy/reviews/book/${bookId}/average-rating`
      );

      return {
        data: {
          bookId: response.bookId.toString(),
          averageRating: response.averageRating,
          totalRatings: 0, // Not provided by backend
          distribution: {}, // Not provided by backend
        },
      };
    } catch (error) {
      console.warn('[API] getBookRatings failed, falling back to dummy data:', error);
      return { data: dummyRating };
    }
  },

  /**
   * Create a new review
   * Endpoint: POST /api/proxy/reviews
   * 
   * Backend expects: { book_id: number, user_id: number, rating: number, comment: string }
   */
  createReview: async (
    bookId: string,
    userId: string,
    rating: number,
    text: string
  ): Promise<{ data: { success: boolean; reviewId?: string } }> => {
    if (USE_DUMMY_DATA) {
      return { data: { success: true, reviewId: `review-${Date.now()}` } };
    }

    try {
      // FIX: Convert String IDs to Numbers so Postgres doesn't crash
      const reviewPayload = {
        book_id: stringToNumberId(bookId),
        user_id: stringToNumberId(userId),
        rating,
        comment: text,
      };

      console.log('[API] Creating review with payload:', reviewPayload);

      const response = await restFetch<BackendReviewResponse>(
        '/proxy/reviews',
        {
          method: 'POST',
          body: JSON.stringify(reviewPayload),
        }
      );

      return {
        data: {
          success: true,
          reviewId: response.id.toString(),
        },
      };
    } catch (error) {
      console.error('[API] createReview failed:', error);
      return { data: { success: false } };
    }
  },

  /**
   * Delete a review
   * Endpoint: DELETE /api/proxy/reviews/{id}
   */
  deleteReview: async (reviewId: string): Promise<{ data: { success: boolean } }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for deleteReview');
      return { data: { success: true } };
    }

    try {
      await restFetch<void>(`/proxy/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      return { data: { success: true } };
    } catch (error) {
      console.error('[API] deleteReview failed:', error);
      return { data: { success: false } };
    }
  },
};

// ===========================================
// Recommendation Service (Now using REAL data)
// ===========================================

export const recommendationService = {
  getUserRecommendations: async (_userId: string) => {
    // FIX: Fetch REAL books from the backend instead of dummy data
    // This ensures the IDs actually exist when you click them.
    try {
      // Just fetch the first 4 real books as "recommendations"
      const realBooks = await bookService.getBooks(1, 4);
      return { data: realBooks.data.data };
    } catch (error) {
      console.warn('Failed to fetch real recommendations:', error);
      return { data: [] };
    }
  },

  getSimilarBooks: async (_bookId: string) => {
    // FIX: Just fetch random real books
    try {
      const realBooks = await bookService.getBooks(1, 4);
      return { data: realBooks.data.data };
    } catch (error) {
      return { data: [] };
    }
  },

  getBookRecommendations: async (bookId: string) => {
    return recommendationService.getSimilarBooks(bookId);
  },
};

// ===========================================
// Search Service (Convenience Wrapper)
// ===========================================

export const searchService = {
  search: async (query: string, filters?: SearchFilters) => {
    return bookService.searchBooks(query, filters);
  },

  getBooksByCategory: async (category: string) => {
    return bookService.getBooksByCategory(category);
  },
};

// ===========================================
// User Profile Service (REST - Hisham's user-profile-service)
// ===========================================
// Endpoint: /api/proxy/profiles (proxied to user-profile-service)
//
// Backend Schema (PostgreSQL):
// - id: BIGSERIAL PK
// - first_name: VARCHAR(255)
// - last_name: VARCHAR(255)
// - email: VARCHAR(255) UNIQUE
// - phone: VARCHAR(255)
// - address: VARCHAR(255)
// - city: VARCHAR(255)
// - country: VARCHAR(255)
// ===========================================

export const userService = {
  /**
   * Get user profile by ID
   * Endpoint: GET /api/proxy/profiles/{userId}
   */
  getProfile: async (userId: string): Promise<{ data: User }> => {
    // Dummy data for development/fallback
    const dummyUser: User = {
      _id: userId,
      email: 'user@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      avatar: undefined,
      phone: '555-123-4567',
      addresses: [
        {
          _id: '1',
          street: '123 Main St',
          city: 'Huntington Beach',
          state: 'CA',
          postalCode: '92648',
          country: 'United States',
          isDefault: true,
        },
      ],
      wishlist: ['1', '2', '3'],
      preferences: {
        favoriteCategories: ['Fiction', 'Science Fiction'],
        notifications: true,
        newsletter: true,
      },
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for getProfile');
      return { data: dummyUser };
    }

    try {
      const backendProfile = await restFetch<BackendUserProfileResponse>(
        `/proxy/profiles/${userId}`
      );

      const user = transformBackendUserProfile(backendProfile);
      logDebug(`Fetched profile for user ${userId}`, user);
      return { data: user };
    } catch (error) {
      console.warn('[API] getProfile failed, falling back to dummy data:', error);
      return { data: dummyUser };
    }
  },

  /**
   * Get all user profiles
   * Endpoint: GET /api/proxy/profiles
   */
  getAllProfiles: async (): Promise<{ data: User[] }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for getAllProfiles');
      return { data: [] };
    }

    try {
      const backendProfiles = await restFetch<BackendUserProfileResponse[]>(
        '/proxy/profiles'
      );

      const users = backendProfiles.map(transformBackendUserProfile);
      logDebug(`Fetched ${users.length} profiles`);
      return { data: users };
    } catch (error) {
      console.warn('[API] getAllProfiles failed:', error);
      return { data: [] };
    }
  },

  /**
   * Create a new user profile
   * Endpoint: POST /api/proxy/profiles
   */
  createProfile: async (profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }): Promise<{ data: { success: boolean; userId?: string } }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for createProfile');
      return { data: { success: true, userId: `user-${Date.now()}` } };
    }

    try {
      // Transform to backend expected format (snake_case)
      const payload = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone || null,
        address: profileData.address || null,
        city: profileData.city || null,
        country: profileData.country || null,
      };

      logDebug('Creating profile with payload:', payload);

      const response = await restFetch<BackendUserProfileResponse>(
        '/proxy/profiles',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      return {
        data: {
          success: true,
          userId: response.id.toString(),
        },
      };
    } catch (error) {
      console.error('[API] createProfile failed:', error);
      return { data: { success: false } };
    }
  },

  /**
   * Update user profile
   * Endpoint: PUT /api/proxy/profiles/{userId} (if supported)
   * 
   * Note: Hisham's controller only has POST (create) and DELETE
   * You may need to add a PUT endpoint to the backend
   */
  updateProfile: async (
    userId: string,
    data: Record<string, unknown>
  ): Promise<{ data: { success: boolean } }> => {
    if (USE_DUMMY_DATA) {
      return { data: { success: true } };
    }

    try {
      // Transform frontend format to backend format
      const payload: Record<string, unknown> = {};
      
      if (data.firstName) payload.first_name = data.firstName;
      if (data.lastName) payload.last_name = data.lastName;
      if (data.email) payload.email = data.email;
      if (data.phone) payload.phone = data.phone;
      if (data.address) payload.address = data.address;
      if (data.city) payload.city = data.city;
      if (data.country) payload.country = data.country;

      console.log(`[API] Updating profile ${userId} via POST:`, payload);

      // Using POST instead of PUT
      await restFetch<BackendUserProfileResponse>(
        '/proxy/profiles', 
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      return { data: { success: true } };
    } catch (error) {
      console.warn('[API] updateProfile failed:', error);
      return { data: { success: false } };
    }
  },

  /**
   * Delete user profile
   * Endpoint: DELETE /api/proxy/profiles/{userId}
   */
  deleteProfile: async (userId: string): Promise<{ data: { success: boolean } }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for deleteProfile');
      return { data: { success: true } };
    }

    try {
      await restFetch<void>(`/proxy/profiles/${userId}`, {
        method: 'DELETE',
      });
      return { data: { success: true } };
    } catch (error) {
      console.error('[API] deleteProfile failed:', error);
      return { data: { success: false } };
    }
  },

  /**
   * Get user's wishlist (Local storage / dummy implementation)
   * Note: Not implemented in Hisham's backend
   */
  getWishlist: async (_userId: string) => {
    const books = getDummyBooks(1, 4).data;
    return { data: books.map(b => b._id) };
  },

  /**
   * Add book to wishlist (Local storage / dummy implementation)
   * Note: Not implemented in Hisham's backend
   */
  addToWishlist: async (_userId: string, _bookId: string) => {
    return { data: { success: true } };
  },

  /**
   * Remove book from wishlist (Local storage / dummy implementation)
   * Note: Not implemented in Hisham's backend
   */
  removeFromWishlist: async (_userId: string, _bookId: string) => {
    return { data: { success: true } };
  },
};

// ===========================================
// Pricing Service (Dummy)
// ===========================================

export const pricingService = {
  getQuote: async (bookId: string, _userId: string, qty: number, coupon?: string) => {
    const book = getDummyBookById(bookId);
    const price = book ? book.price * qty : 0;
    const discount = coupon ? 5.0 : 0;
    return {
      data: {
        price,
        discount,
        total: price - discount,
      },
    };
  },

  validateCoupon: async (code: string, _userId: string) => {
    const validCoupons = ['SAVE10', 'WELCOME', 'BOOKWORM'];
    const isValid = validCoupons.includes(code.toUpperCase());
    return {
      data: {
        valid: isValid,
        discountAmount: isValid ? 10.0 : 0,
        discountPercent: isValid ? 10 : 0,
      },
    };
  },
};

// ===========================================
// Shipping Service (Dummy)
// ===========================================

export const shippingService = {
  trackShipment: async (trackingNumber: string) => {
    return {
      data: {
        trackingNumber,
        status: 'in_transit',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            status: 'Package received by carrier',
            location: 'San Francisco, CA',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            status: 'Out for delivery',
            location: 'Huntington Beach, CA',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };
  },
};

// ===========================================
// Auth Service
// ===========================================

export const authService = {
  login: async (_email: string, _password: string) => {
    // This should be handled by AWS Cognito/Amplify
    throw new Error('Use AWS Amplify for authentication');
  },

  register: async (_email: string, _password: string, _name: string) => {
    // This should be handled by AWS Cognito/Amplify
    throw new Error('Use AWS Amplify for authentication');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },
};

// Default export for backward compatibility
export default {
  bookService,
  authorService,
  orderService,
  cartService,
  reviewService,
  recommendationService,
  searchService,
  userService,
  pricingService,
  shippingService,
  authService,
};