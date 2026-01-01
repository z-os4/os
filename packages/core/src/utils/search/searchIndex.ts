/**
 * Search Index Implementation for zOS
 *
 * Pre-processed index for fast searching with tokenization and stemming
 */

import type {
  SearchIndex,
  SearchIndexOptions,
  IndexedItem,
  FuzzySearchResult,
  HighlightSegment,
} from './types';

/**
 * Default English stop words
 */
const DEFAULT_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
  'the', 'to', 'was', 'were', 'will', 'with',
]);

/**
 * Simple Porter-like stemmer for English
 */
function defaultStemmer(word: string): string {
  let stem = word.toLowerCase();

  // Common suffix rules
  const suffixes = [
    { suffix: 'ational', replacement: 'ate' },
    { suffix: 'tional', replacement: 'tion' },
    { suffix: 'ization', replacement: 'ize' },
    { suffix: 'iveness', replacement: 'ive' },
    { suffix: 'fulness', replacement: 'ful' },
    { suffix: 'ousness', replacement: 'ous' },
    { suffix: 'ement', replacement: '' },
    { suffix: 'ment', replacement: '' },
    { suffix: 'ness', replacement: '' },
    { suffix: 'able', replacement: '' },
    { suffix: 'ible', replacement: '' },
    { suffix: 'ing', replacement: '' },
    { suffix: 'tion', replacement: 't' },
    { suffix: 'sion', replacement: 's' },
    { suffix: 'ally', replacement: '' },
    { suffix: 'ful', replacement: '' },
    { suffix: 'ous', replacement: '' },
    { suffix: 'ive', replacement: '' },
    { suffix: 'ly', replacement: '' },
    { suffix: 'ed', replacement: '' },
    { suffix: 'er', replacement: '' },
    { suffix: 'es', replacement: '' },
    { suffix: 's', replacement: '' },
  ];

  for (const { suffix, replacement } of suffixes) {
    if (stem.endsWith(suffix) && stem.length > suffix.length + 2) {
      return stem.slice(0, -suffix.length) + replacement;
    }
  }

  return stem;
}

/**
 * Default tokenizer - splits on word boundaries
 */
function defaultTokenizer(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Get nested value from object
 */
function getNestedValue<T>(obj: T, path: string): unknown {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[key];
  }

  return value;
}

/**
 * Generate unique ID for item
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Create a search index for fast searching
 *
 * @example
 * ```ts
 * const index = createSearchIndex(notes, ['title', 'content', 'tags']);
 *
 * // Search
 * const results = index.search('react hooks');
 *
 * // Incremental updates
 * index.add(newNote);
 * index.update('note-1', updatedNote);
 * index.remove('note-2');
 * ```
 */
export function createSearchIndex<T extends { id?: string }>(
  items: T[],
  options: SearchIndexOptions<T>
): SearchIndex<T> {
  const {
    fields,
    stemming = true,
    tokenizer = defaultTokenizer,
    stemmer = defaultStemmer,
    stopWords = DEFAULT_STOP_WORDS,
    minTokenLength = 2,
  } = options;

  // Internal storage
  const indexedItems = new Map<string, IndexedItem<T>>();

  // Inverted index: token -> Set<item_id>
  const invertedIndex = new Map<string, Set<string>>();

  /**
   * Process text into tokens
   */
  function processText(text: string): string[] {
    const tokens = tokenizer(text);
    const processed: string[] = [];

    for (const token of tokens) {
      if (token.length < minTokenLength) continue;
      if (stopWords.has(token)) continue;

      const stemmed = stemming ? stemmer(token) : token;
      if (stemmed.length >= minTokenLength) {
        processed.push(stemmed);
      }
    }

    return processed;
  }

  /**
   * Index a single item
   */
  function indexItem(item: T, id: string): void {
    const tokens = new Map<string, Set<string>>();

    for (const field of fields) {
      const fieldStr = String(field);
      const value = getNestedValue(item, fieldStr);

      if (typeof value === 'string') {
        const fieldTokens = processText(value);
        tokens.set(fieldStr, new Set(fieldTokens));

        // Update inverted index
        for (const token of fieldTokens) {
          if (!invertedIndex.has(token)) {
            invertedIndex.set(token, new Set());
          }
          invertedIndex.get(token)!.add(id);
        }
      } else if (Array.isArray(value)) {
        const allTokens = new Set<string>();
        for (const v of value) {
          if (typeof v === 'string') {
            for (const t of processText(v)) {
              allTokens.add(t);
              if (!invertedIndex.has(t)) {
                invertedIndex.set(t, new Set());
              }
              invertedIndex.get(t)!.add(id);
            }
          }
        }
        tokens.set(fieldStr, allTokens);
      }
    }

    indexedItems.set(id, { id, item, tokens });
  }

  /**
   * Remove item from inverted index
   */
  function removeFromInvertedIndex(id: string): void {
    const indexed = indexedItems.get(id);
    if (!indexed) return;

    for (const [, fieldTokens] of indexed.tokens) {
      for (const token of fieldTokens) {
        const itemIds = invertedIndex.get(token);
        if (itemIds) {
          itemIds.delete(id);
          if (itemIds.size === 0) {
            invertedIndex.delete(token);
          }
        }
      }
    }
  }

  // Build initial index
  for (const item of items) {
    const id = item.id ?? generateId();
    indexItem(item, id);
  }

  return {
    search(query: string, searchOptions = {}): FuzzySearchResult<T>[] {
      const { limit, threshold = 0.3 } = searchOptions;
      const queryTokens = processText(query);

      if (queryTokens.length === 0) {
        // Return all items with score 1 if no query
        return Array.from(indexedItems.values()).map(({ item }) => ({
          item,
          score: 1,
          matches: {},
          highlights: {},
        }));
      }

      // Find candidate items using inverted index
      const candidateScores = new Map<string, number>();

      for (const queryToken of queryTokens) {
        // Exact token match
        const exactMatches = invertedIndex.get(queryToken);
        if (exactMatches) {
          for (const id of exactMatches) {
            candidateScores.set(id, (candidateScores.get(id) ?? 0) + 1);
          }
        }

        // Prefix matching for partial tokens
        for (const [indexToken, itemIds] of invertedIndex) {
          if (indexToken.startsWith(queryToken) && indexToken !== queryToken) {
            const prefixScore = queryToken.length / indexToken.length;
            for (const id of itemIds) {
              candidateScores.set(
                id,
                (candidateScores.get(id) ?? 0) + prefixScore * 0.8
              );
            }
          }
        }
      }

      // Score and rank candidates
      const results: FuzzySearchResult<T>[] = [];

      for (const [id, matchCount] of candidateScores) {
        const indexed = indexedItems.get(id);
        if (!indexed) continue;

        const score = Math.min(matchCount / queryTokens.length, 1);
        if (score < threshold) continue;

        // Build match details
        const matches: Record<string, { key: string; indices: number[]; score: number; value: string }> = {};
        const highlights: Record<string, HighlightSegment[]> = {};

        for (const [field, fieldTokens] of indexed.tokens) {
          const value = getNestedValue(indexed.item, field);
          if (typeof value !== 'string') continue;

          const matchingTokens = queryTokens.filter((qt) => {
            for (const ft of fieldTokens) {
              if (ft === qt || ft.startsWith(qt)) return true;
            }
            return false;
          });

          if (matchingTokens.length > 0) {
            matches[field] = {
              key: field,
              indices: [],
              score: matchingTokens.length / queryTokens.length,
              value,
            };

            // Simple highlighting based on original query words
            const originalTokens = tokenizer(query);
            const highlightedIndices = new Set<number>();

            for (const origToken of originalTokens) {
              const lowerValue = value.toLowerCase();
              let searchStart = 0;
              let foundIndex = lowerValue.indexOf(origToken, searchStart);

              while (foundIndex !== -1) {
                for (let i = foundIndex; i < foundIndex + origToken.length; i++) {
                  highlightedIndices.add(i);
                }
                searchStart = foundIndex + 1;
                foundIndex = lowerValue.indexOf(origToken, searchStart);
              }
            }

            // Build highlight segments
            if (highlightedIndices.size > 0) {
              const segments: HighlightSegment[] = [];
              let currentText = '';
              let currentHighlighted = highlightedIndices.has(0);

              for (let i = 0; i < value.length; i++) {
                const isHighlighted = highlightedIndices.has(i);
                if (isHighlighted !== currentHighlighted) {
                  if (currentText) {
                    segments.push({ text: currentText, highlighted: currentHighlighted });
                  }
                  currentText = value[i];
                  currentHighlighted = isHighlighted;
                } else {
                  currentText += value[i];
                }
              }
              if (currentText) {
                segments.push({ text: currentText, highlighted: currentHighlighted });
              }
              highlights[field] = segments;
            } else {
              highlights[field] = [{ text: value, highlighted: false }];
            }
          }
        }

        results.push({
          item: indexed.item,
          score,
          matches,
          highlights,
        });
      }

      // Sort by score
      results.sort((a, b) => b.score - a.score);

      // Apply limit
      if (limit && limit > 0) {
        return results.slice(0, limit);
      }

      return results;
    },

    add(item: T, id?: string): void {
      const itemId = id ?? item.id ?? generateId();
      if (indexedItems.has(itemId)) {
        this.remove(itemId);
      }
      indexItem(item, itemId);
    },

    remove(id: string): void {
      removeFromInvertedIndex(id);
      indexedItems.delete(id);
    },

    update(id: string, item: T): void {
      this.remove(id);
      indexItem(item, id);
    },

    clear(): void {
      indexedItems.clear();
      invertedIndex.clear();
    },

    size(): number {
      return indexedItems.size;
    },
  };
}

export type { SearchIndex, SearchIndexOptions, IndexedItem };
