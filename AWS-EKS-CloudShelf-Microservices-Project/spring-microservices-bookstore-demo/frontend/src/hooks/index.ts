// ===========================================
// hooks/index.ts - Hook Exports
// ===========================================

export { useBookSearch } from './useBookSearch';
export type { UseBookSearchOptions, UseBookSearchResult } from './useBookSearch';

// Re-export utility functions for direct use if needed
export {
  levenshteinDistance,
  calculateSimilarity,
  isFuzzyMatch,
  calculateRelevanceScore,
  applyFilters,
  applySorting,
} from './useBookSearch';