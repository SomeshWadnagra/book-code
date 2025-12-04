export interface BackendUserProfileResponse {
  id: number;           // PostgreSQL BIGSERIAL
  first_name: string;
  last_name: string;
  email: string;        // UNIQUE
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
}

/**
 * AUTHOR SERVICE (PostgreSQL)
 * Schema: id BIGINT PK, name VARCHAR(255), birth_date DATE
 */
export interface BackendAuthorResponse {
  id: number;           // PostgreSQL BIGINT
  name: string;
  birthDate: string;    // DATE → ISO date string "YYYY-MM-DD"
  // Note: Java uses camelCase (birthDate), DB uses snake_case (birth_date)
}

/**
 * ORDER SERVICE (PostgreSQL)
 * Tables: t_orders (id, order_number), t_order_line_items (id, sku_code, price, quantity)
 */
export interface BackendOrderResponse {
  id: number;           // PostgreSQL BIGINT
  orderNumber: string;
  orderLineItemsDtoList: BackendOrderLineItem[];
}

export interface BackendOrderLineItem {
  id?: number;          // PostgreSQL BIGINT
  skuCode: string;      // VARCHAR(255)
  price: number;        // DECIMAL(19,2)
  quantity: number;     // INTEGER
}

/**
 * STOCK CHECK SERVICE (PostgreSQL)
 * Schema: id BIGINT PK, sku_code VARCHAR(255), quantity INTEGER
 */
export interface BackendStockCheckResponse {
  id: number;           // PostgreSQL BIGINT
  skuCode: string;      // VARCHAR(255)
  quantity: number;     // INTEGER
}

// --------------------------------------------
// Frontend Types (enriched UI models)
// --------------------------------------------

/**
 * Frontend Book model - enriched version with UI-specific fields
 * Maps from BackendBookResponse with sensible defaults
 */
export interface Book {
  // Core fields (from backend)
  _id: string;              // Mapped from backend "id" (MongoDB ObjectId string)
  title: string;            // Mapped from backend "name"
  description: string;
  price: number;
  
  // Extended fields (frontend defaults when not provided by backend)
  author: string;
  category: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  tags?: string[];
}

/**
 * Transform backend BookResponse to frontend Book
 * This bridges the simple backend model to the rich frontend UI model
 */
export function transformBackendBook(backendBook: BackendBookResponse): Book {
  return {
    _id: backendBook.id,
    title: backendBook.name,
    description: backendBook.description || 'No description available.',
    price: backendBook.price ?? 0,
    
    // Default values for fields not provided by backend
    author: 'Unknown Author',
    category: 'General',
    coverImage: generatePlaceholderCover(backendBook.name),
    rating: 0,
    reviewCount: 0,
    inStock: true,
    stockCount: 10,
    isbn: undefined,
    publisher: undefined,
    publishedDate: undefined,
    tags: [],
  };
}

/**
 * Generate a placeholder cover image URL based on book name
 */
function generatePlaceholderCover(bookName: string): string {
  // Create a hash from the book name for consistent color
  const hash = bookName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = Math.abs(hash) % 360;
  const hexColor = hslToHex(hue, 70, 50);
  
  // Use placeholder service with encoded title
  const encodedTitle = encodeURIComponent(bookName.slice(0, 20));
  return `https://via.placeholder.com/200x300/${hexColor}/ffffff?text=${encodedTitle}`;
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

// --------------------------------------------
// Review Types (handling the ID mismatch)
// --------------------------------------------

/**
 * Frontend Review model
 * Note: We use string for bookId even though backend stores BIGINT,
 * because Book Service uses string IDs (MongoDB ObjectId)
 */
export interface Review {
  _id: string;              // Converted from backend id (BIGINT → string)
  bookId: string;           // ⚠️ String to match Book._id, even though backend is BIGINT
  userId: string;           // Converted from BIGINT for consistency
  userName: string;         // Derived from User Profile Service
  rating: number;
  text: string;             // Mapped from backend "comment"
  verifiedPurchase: boolean;
  createdAt: string;
  helpful: number;
}

/**
 * Transform backend ReviewResponse to frontend Review
 */
export function transformBackendReview(
  backendReview: BackendReviewResponse,
  userName: string = 'Anonymous'
): Review {
  return {
    _id: backendReview.id.toString(),
    bookId: backendReview.book_id.toString(), // ⚠️ BIGINT → string for frontend consistency
    userId: backendReview.user_id.toString(),
    userName,
    rating: backendReview.rating,
    text: backendReview.comment,
    verifiedPurchase: false, // Not tracked in backend
    createdAt: backendReview.created_at,
    helpful: 0, // Not tracked in backend
  };
}

export interface Rating {
  bookId: string;
  averageRating: number;
  totalRatings: number;
  distribution: {
    [key: number]: number; // 1-5 star counts
  };
}

// --------------------------------------------
// User Types
// --------------------------------------------

/**
 * Frontend User model - enriched from BackendUserProfileResponse
 */
export interface User {
  _id: string;              // Converted from BIGINT
  email: string;
  name: string;             // Combined from first_name + last_name
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  wishlist: string[];       // Array of book IDs
  preferences?: UserPreferences;
  createdAt: string;
}

/**
 * Transform backend UserProfileResponse to frontend User
 */
export function transformBackendUserProfile(profile: BackendUserProfileResponse): User {
  return {
    _id: profile.id.toString(),
    email: profile.email,
    name: `${profile.first_name} ${profile.last_name}`.trim(),
    firstName: profile.first_name,
    lastName: profile.last_name,
    phone: profile.phone || undefined,
    avatar: undefined,
    addresses: profile.address ? [{
      _id: '1',
      street: profile.address,
      city: profile.city || '',
      state: '',
      postalCode: '',
      country: profile.country || '',
      isDefault: true,
    }] : [],
    wishlist: [],
    preferences: {
      favoriteCategories: [],
      notifications: true,
      newsletter: true,
    },
    createdAt: new Date().toISOString(),
  };
}

export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPreferences {
  favoriteCategories: string[];
  notifications: boolean;
  newsletter: boolean;
}

// --------------------------------------------
// Cart Types
// --------------------------------------------

export interface CartItem {
  bookId: string;           // String ID (MongoDB)
  book: Book;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------
// Order Types
// --------------------------------------------

export interface Order {
  _id: string;              // Converted from BIGINT
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: Address;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  bookId: string;           // sku_code in backend
  title: string;
  quantity: number;
  price: number;
}

/**
 * Transform backend Order to frontend Order
 */
export function transformBackendOrder(backendOrder: BackendOrderResponse): Partial<Order> {
  return {
    _id: backendOrder.id.toString(),
    orderNumber: backendOrder.orderNumber,
    items: backendOrder.orderLineItemsDtoList.map(item => ({
      bookId: item.skuCode,
      title: item.skuCode, // Would need book lookup for real title
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: backendOrder.orderLineItemsDtoList.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    status: 'pending',
    paymentStatus: 'pending',
  };
}

// --------------------------------------------
// Author Types
// --------------------------------------------

export interface Author {
  id: string;               // Converted from BIGINT
  name: string;
  birthDate: string;        // ISO date "YYYY-MM-DD"
}

/**
 * Transform backend Author to frontend Author
 */
export function transformBackendAuthor(backendAuthor: BackendAuthorResponse): Author {
  return {
    id: backendAuthor.id.toString(),
    name: backendAuthor.name,
    birthDate: backendAuthor.birthDate,
  };
}

// --------------------------------------------
// Stock Types
// --------------------------------------------

export interface StockInfo {
  skuCode: string;
  quantity: number;
  inStock: boolean;
}

export function transformBackendStock(backendStock: BackendStockCheckResponse): StockInfo {
  return {
    skuCode: backendStock.skuCode,
    quantity: backendStock.quantity,
    inStock: backendStock.quantity > 0,
  };
}

// --------------------------------------------
// Search & Filter Types
// --------------------------------------------

export interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  inStockOnly?: boolean;
  sortBy?: 'relevance' | 'price' | 'rating' | 'newest';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// --------------------------------------------
// GraphQL Types
// --------------------------------------------

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export interface GetAllBooksResponse {
  getAllBooks: BackendBookResponse[];
}

export interface CreateBookResponse {
  createBook: BackendBookResponse;
}

export interface DeleteBookResponse {
  deleteBook: boolean;
}

// --------------------------------------------
// Input Types (for mutations/POST requests)
// --------------------------------------------

/**
 * Input for creating a book via GraphQL
 * Matches BookRequest in backend
 */
export interface BookInput {
  name: string;             // Backend uses "name" not "title"
  description: string;
  price: number;
}

/**
 * Input for placing an order
 * Matches OrderRequest in backend
 */
export interface OrderInput {
  orderLineItemsDtoList: Array<{
    skuCode: string;
    price: number;
    quantity: number;
  }>;
}

/**
 * Input for creating an author
 */
export interface AuthorInput {
  name: string;
  birthDate: string;        // ISO date "YYYY-MM-DD"
}

/**
 * Input for creating a review
 */
export interface ReviewInput {
  book_id: number;          // ⚠️ Backend expects BIGINT
  user_id: number;          // ⚠️ Backend expects BIGINT
  rating: number;
  comment: string;
}

/**
 * Input for creating/updating user profile
 */
export interface UserProfileInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

// --------------------------------------------
// API Endpoint Constants
// Based on Hisham's microservices
// --------------------------------------------

export const API_ENDPOINTS = {
  // GraphQL (Book Service via API Gateway)
  GRAPHQL: '/api/graphql',
  
  // REST endpoints
  AUTHORS: '/api/authors',
  ORDERS: '/api/order',
  
  // These would be direct service calls if not proxied through gateway:
  // REVIEWS: 'http://reviews-service:8080/api/reviews',
  // USER_PROFILES: 'http://user-profile-service:8080/api/profiles',
  // STOCK: 'http://stock-check-service:8080/api/stock',
} as const;

// --------------------------------------------
// Type Guards
// --------------------------------------------

export function isBackendBookResponse(obj: unknown): obj is BackendBookResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    typeof (obj as BackendBookResponse).id === 'string' &&
    typeof (obj as BackendBookResponse).name === 'string'
  );
}

export function isGraphQLError(response: GraphQLResponse<unknown>): boolean {
  return !!(response.errors && response.errors.length > 0);
}






