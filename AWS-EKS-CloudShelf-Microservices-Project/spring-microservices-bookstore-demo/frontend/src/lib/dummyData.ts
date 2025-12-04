import { Book } from '@/types';

export const DUMMY_BOOKS: Book[] = [
  {
    _id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    description: 'Between life and death there is a library. Between what was and what could be. A woman finds herself in a library where every book allows her to live out an alternate life she could have lived.',
    price: 12.99,
    category: 'Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0525559474-M.jpg',
    rating: 4.5,
    reviewCount: 3245,
    inStock: true,
    stockCount: 15,
    isbn: '978-0525559474',
    publisher: 'Viking',
    publishedDate: '2020-08-13',
    tags: ['Fantasy', 'Life', 'Library']
  },
  {
    _id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'Transform your life with tiny changes. Atomic Habits reveals how small habits can lead to remarkable results, backed by science and real-world examples.',
    price: 14.99,
    category: 'Self-Help',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0735211292-M.jpg',
    rating: 4.8,
    reviewCount: 5821,
    inStock: true,
    stockCount: 23,
    isbn: '978-0735211292',
    publisher: 'Avery',
    publishedDate: '2018-10-16',
    tags: ['Habits', 'Self-Improvement', 'Productivity']
  },
  {
    _id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A sweeping epic of politics, religion, and ecology set on the desert planet Arrakis. Join Paul Atreides on an epic journey of power and destiny.',
    price: 15.99,
    category: 'Science Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0441172719-M.jpg',
    rating: 4.7,
    reviewCount: 4567,
    inStock: true,
    stockCount: 12,
    isbn: '978-0441172719',
    publisher: 'Ace',
    publishedDate: '1965-06-01',
    tags: ['Science Fiction', 'Epic', 'Adventure']
  },
  {
    _id: '4',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    description: 'Transform your spiritual being and remove pain and suffering from your life. A guide to spiritual enlightenment and living in the present moment.',
    price: 13.99,
    category: 'Self-Help',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-1577314806-M.jpg',
    rating: 4.4,
    reviewCount: 3456,
    inStock: true,
    stockCount: 18,
    isbn: '978-1577314806',
    publisher: 'New World Library',
    publishedDate: '1997-09-01',
    tags: ['Spirituality', 'Mindfulness', 'Philosophy']
  },
  {
    _id: '5',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    description: 'A lone astronaut must save Earth from extinction. A gripping science fiction adventure about survival, courage, and human ingenuity.',
    price: 16.99,
    category: 'Science Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0593135204-M.jpg',
    rating: 4.6,
    reviewCount: 4234,
    inStock: true,
    stockCount: 8,
    isbn: '978-0593135204',
    publisher: 'Ballantine Books',
    publishedDate: '2021-05-04',
    tags: ['Science Fiction', 'Adventure', 'Space']
  },
  {
    _id: '6',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    description: 'A woman shoots her husband five times and then never speaks again. A psychotherapist becomes obsessed with uncovering why she committed the perfect crime.',
    price: 14.99,
    category: 'Mystery',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-1250295385-M.jpg',
    rating: 4.5,
    reviewCount: 5023,
    inStock: true,
    stockCount: 20,
    isbn: '978-1250295385',
    publisher: 'Celadon Books',
    publishedDate: '2019-02-05',
    tags: ['Mystery', 'Thriller', 'Psychological']
  },
  {
    _id: '7',
    title: 'Educated',
    author: 'Tara Westover',
    description: 'A memoir about a young woman who leaves her survivalist family to pursue education. A powerful story of transformation and self-discovery.',
    price: 17.99,
    category: 'Biography',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0399590504-M.jpg',
    rating: 4.6,
    reviewCount: 6789,
    inStock: true,
    stockCount: 11,
    isbn: '978-0399590504',
    publisher: 'Random House',
    publishedDate: '2018-02-20',
    tags: ['Biography', 'Memoir', 'Education']
  },
  {
    _id: '8',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'The definitive American novel. Enter the lavish world of 1920s New York and witness the tragic pursuit of an impossible dream.',
    price: 9.99,
    category: 'Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0743273565-M.jpg',
    rating: 4.3,
    reviewCount: 7234,
    inStock: true,
    stockCount: 25,
    isbn: '978-0743273565',
    publisher: 'Scribner',
    publishedDate: '1925-04-10',
    tags: ['Classic', 'Romance', 'American Literature']
  },
  {
    _id: '9',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    description: 'A sweeping history of humankind from the Stone Age to modern times. Explore how humans came to dominate the world.',
    price: 18.99,
    category: 'Non-Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0062316097-M.jpg',
    rating: 4.7,
    reviewCount: 8456,
    inStock: true,
    stockCount: 14,
    isbn: '978-0062316097',
    publisher: 'HarperCollins',
    publishedDate: '2014-09-04',
    tags: ['History', 'Anthropology', 'Science']
  },
  {
    _id: '10',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'An unexpected adventure begins when a reluctant hobbit embarks on a quest to reclaim treasure guarded by a dragon.',
    price: 13.99,
    category: 'Fantasy',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0547928227-M.jpg',
    rating: 4.8,
    reviewCount: 6123,
    inStock: true,
    stockCount: 19,
    isbn: '978-0547928227',
    publisher: 'Mariner Books',
    publishedDate: '1937-09-21',
    tags: ['Fantasy', 'Adventure', 'Classics']
  },
  {
    _id: '11',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    description: 'Explore the two systems of thought that control the way we think. Understand how we make decisions and why we often get them wrong.',
    price: 16.99,
    category: 'Non-Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0374275631-M.jpg',
    rating: 4.5,
    reviewCount: 5234,
    inStock: true,
    stockCount: 9,
    isbn: '978-0374275631',
    publisher: 'Farrar, Straus and Giroux',
    publishedDate: '2011-10-25',
    tags: ['Psychology', 'Cognition', 'Decision-Making']
  },
  {
    _id: '12',
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian masterpiece set in a totalitarian regime. A gripping exploration of power, control, and the nature of truth.',
    price: 11.99,
    category: 'Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/978-0451524935-M.jpg',
    rating: 4.6,
    reviewCount: 7892,
    inStock: false,
    stockCount: 0,
    isbn: '978-0451524935',
    publisher: 'Signet Classics',
    publishedDate: '1949-06-08',
    tags: ['Dystopian', 'Classic', 'Science Fiction']
  }
];

// Function to get dummy books with pagination
export const getDummyBooks = (page: number = 1, limit: number = 12) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedBooks = DUMMY_BOOKS.slice(start, end);

  return {
    data: paginatedBooks,
    total: DUMMY_BOOKS.length,
    page,
    limit,
    hasMore: end < DUMMY_BOOKS.length,
  };
};

// Function to calculate Levenshtein distance (edit distance) between two strings
// This measures how many single-character edits are needed to change one string into another
const levenshteinDistance = (str1: string, str2: string): number => {
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
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[len1][len2];
};

// Calculate similarity score (0 to 1, where 1 is perfect match)
const calculateSimilarity = (str1: string, str2: string): number => {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
};

// Check if query matches with a similarity threshold
const fuzzyMatch = (query: string, target: string, threshold: number = 0.6): boolean => {
  const similarity = calculateSimilarity(query, target);
  return similarity >= threshold;
};

// Calculate relevance score for ranking results
const calculateRelevanceScore = (book: any, query: string): number => {
  const lowerQuery = query.toLowerCase();
  let score = 0;
  
  // Exact substring matches get highest priority
  if (book.title.toLowerCase().includes(lowerQuery)) score += 100;
  if (book.author.toLowerCase().includes(lowerQuery)) score += 80;
  if (book.description.toLowerCase().includes(lowerQuery)) score += 30;
  
  // Word-by-word fuzzy matching for partial matches
  const queryWords = lowerQuery.split(/\s+/);
  const titleWords = book.title.toLowerCase().split(/\s+/);
  const authorWords = book.author.toLowerCase().split(/\s+/);
  
  queryWords.forEach(queryWord => {
    // Check title words
    titleWords.forEach(titleWord => {
      const similarity = calculateSimilarity(queryWord, titleWord);
      if (similarity >= 0.6) score += similarity * 40;
    });
    
    // Check author words
    authorWords.forEach(authorWord => {
      const similarity = calculateSimilarity(queryWord, authorWord);
      if (similarity >= 0.6) score += similarity * 30;
    });
    
    // Check tags with fuzzy matching
    if (book.tags) {
      book.tags.forEach((tag: string) => {
        const similarity = calculateSimilarity(queryWord, tag.toLowerCase());
        if (similarity >= 0.6) score += similarity * 20;
      });
    }
  });
  
  // Bonus for matches at the beginning of title/author
  if (book.title.toLowerCase().startsWith(lowerQuery)) score += 50;
  if (book.author.toLowerCase().startsWith(lowerQuery)) score += 40;
  
  // Bonus points based on book rating and popularity
  score += book.rating * 2;
  score += Math.log(book.reviewCount + 1) * 1;
  
  return score;
};

// Enhanced search function with fuzzy matching and relevance scoring
export const searchDummyBooks = (query: string) => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/);
  
  // Score all books
  const scoredBooks = DUMMY_BOOKS.map(book => ({
    book,
    score: calculateRelevanceScore(book, query)
  }));
  
  // Filter books with score > 0 and sort by score (highest first)
  const results = scoredBooks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.book);
  
  // If no results with fuzzy matching, try broader substring search
  if (results.length === 0) {
    return DUMMY_BOOKS.filter(book => {
      const searchText = `${book.title} ${book.author} ${book.description} ${book.tags?.join(' ')}`.toLowerCase();
      return queryWords.some(word => searchText.includes(word));
    });
  }
  
  return results;
};

// Function to get books by category
export const getDummyBooksByCategory = (category: string) => {
  return DUMMY_BOOKS.filter(
    (book) => book.category.toLowerCase() === category.toLowerCase()
  );
};

// Function to get a single book by ID
export const getDummyBookById = (id: string) => {
  return DUMMY_BOOKS.find((book) => book._id === id);
};
