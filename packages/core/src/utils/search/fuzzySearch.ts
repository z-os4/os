/**
 * Fuzzy Search Implementation for zOS
 *
 * Score-based fuzzy matching with character highlighting
 */

import type {
  FuzzySearchOptions,
  FuzzySearchResult,
  FuzzyMatch,
  HighlightSegment,
} from './types';

/**
 * Default search options
 */
const DEFAULT_OPTIONS = {
  threshold: 0.3,
  caseSensitive: false,
  sortByScore: true,
} as const;

/**
 * Get nested value from object using dot notation path
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
 * Calculate fuzzy match score between query and text
 * Returns score (0-1) and matching character indices
 */
function calculateFuzzyMatch(
  query: string,
  text: string,
  caseSensitive: boolean
): { score: number; indices: number[] } | null {
  const normalizedQuery = caseSensitive ? query : query.toLowerCase();
  const normalizedText = caseSensitive ? text : text.toLowerCase();

  if (normalizedQuery.length === 0) {
    return { score: 1, indices: [] };
  }

  if (normalizedQuery.length > normalizedText.length) {
    return null;
  }

  const indices: number[] = [];
  let queryIndex = 0;
  let consecutiveMatches = 0;
  let totalConsecutive = 0;
  let startIndex = -1;

  // Find matching characters
  for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIndex]) {
      if (startIndex === -1) startIndex = i;
      indices.push(i);

      // Track consecutive matches
      if (indices.length > 1 && indices[indices.length - 1] === indices[indices.length - 2] + 1) {
        consecutiveMatches++;
        totalConsecutive += consecutiveMatches;
      } else {
        consecutiveMatches = 0;
      }

      queryIndex++;
    }
  }

  // All query characters must be found
  if (queryIndex !== normalizedQuery.length) {
    return null;
  }

  // Calculate score based on multiple factors
  const matchLength = indices[indices.length - 1] - indices[0] + 1;

  // Factor 1: Coverage - what portion of query matches
  const coverage = indices.length / normalizedQuery.length;

  // Factor 2: Tightness - how close together are the matches
  const tightness = indices.length / matchLength;

  // Factor 3: Position - prefer matches at start
  const positionBonus = startIndex === 0 ? 0.15 : startIndex < 3 ? 0.1 : 0;

  // Factor 4: Consecutive bonus
  const consecutiveBonus = Math.min(totalConsecutive / indices.length, 1) * 0.2;

  // Factor 5: Word boundary bonus (matching after space, _, -, etc.)
  let boundaryBonus = 0;
  for (const idx of indices) {
    if (idx === 0 || /[\s_\-./]/.test(normalizedText[idx - 1])) {
      boundaryBonus += 0.05;
    }
  }
  boundaryBonus = Math.min(boundaryBonus, 0.15);

  // Factor 6: Exact match bonus
  const exactMatchBonus = normalizedQuery === normalizedText ? 0.3 : 0;

  // Factor 7: Prefix match bonus
  const prefixBonus = normalizedText.startsWith(normalizedQuery) ? 0.25 : 0;

  // Calculate final score
  const baseScore = (coverage * 0.3) + (tightness * 0.4);
  const bonuses = positionBonus + consecutiveBonus + boundaryBonus + exactMatchBonus + prefixBonus;
  const score = Math.min(baseScore + bonuses, 1);

  return { score, indices };
}

/**
 * Convert match indices to highlight segments
 */
function createHighlights(text: string, indices: number[]): HighlightSegment[] {
  if (indices.length === 0) {
    return [{ text, highlighted: false }];
  }

  const segments: HighlightSegment[] = [];
  const indexSet = new Set(indices);
  let currentSegment = '';
  let currentHighlighted = indexSet.has(0);

  for (let i = 0; i < text.length; i++) {
    const isHighlighted = indexSet.has(i);

    if (isHighlighted !== currentHighlighted) {
      if (currentSegment) {
        segments.push({ text: currentSegment, highlighted: currentHighlighted });
      }
      currentSegment = text[i];
      currentHighlighted = isHighlighted;
    } else {
      currentSegment += text[i];
    }
  }

  if (currentSegment) {
    segments.push({ text: currentSegment, highlighted: currentHighlighted });
  }

  return segments;
}

/**
 * Fuzzy search through items with score-based ranking and character highlighting
 *
 * @example
 * ```ts
 * const results = fuzzySearch('nts', notes, {
 *   keys: ['title', 'content'],
 *   threshold: 0.3,
 * });
 * // → [{ item: note, score: 0.9, matches: { title: [0, 2, 3] } }]
 * ```
 */
export function fuzzySearch<T>(
  query: string,
  items: T[],
  options: FuzzySearchOptions<T>
): FuzzySearchResult<T>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { keys, threshold, limit, caseSensitive, sortByScore } = opts;

  // Empty query returns all items with max score
  if (!query.trim()) {
    return items.map((item) => ({
      item,
      score: 1,
      matches: {},
      highlights: {},
    }));
  }

  const results: FuzzySearchResult<T>[] = [];

  for (const item of items) {
    const matches: Record<string, FuzzyMatch> = {};
    const highlights: Record<string, HighlightSegment[]> = {};
    let bestScore = 0;
    let hasMatch = false;

    for (const key of keys) {
      const keyStr = String(key);
      const value = getNestedValue(item, keyStr);

      if (typeof value !== 'string') continue;

      const match = calculateFuzzyMatch(query, value, caseSensitive ?? false);

      if (match && match.score >= (threshold ?? 0.3)) {
        hasMatch = true;
        matches[keyStr] = {
          key: keyStr,
          indices: match.indices,
          score: match.score,
          value,
        };
        highlights[keyStr] = createHighlights(value, match.indices);

        if (match.score > bestScore) {
          bestScore = match.score;
        }
      }
    }

    if (hasMatch) {
      results.push({
        item,
        score: bestScore,
        matches,
        highlights,
      });
    }
  }

  // Sort by score if enabled
  if (sortByScore) {
    results.sort((a, b) => b.score - a.score);
  }

  // Apply limit if specified
  if (limit && limit > 0) {
    return results.slice(0, limit);
  }

  return results;
}

/**
 * Create highlighted React-compatible nodes from search result
 */
export function renderHighlights(
  segments: HighlightSegment[],
  highlightTag: keyof JSX.IntrinsicElements = 'mark'
): (string | JSX.Element)[] {
  return segments.map((segment, index) => {
    if (segment.highlighted) {
      const Tag = highlightTag;
      // Return a structure that can be used with React
      return {
        type: Tag,
        key: index,
        props: { children: segment.text },
      } as unknown as JSX.Element;
    }
    return segment.text;
  });
}

/**
 * Simple string highlighting for non-React contexts
 */
export function highlightString(
  segments: HighlightSegment[],
  wrapper: { open: string; close: string } = { open: '<mark>', close: '</mark>' }
): string {
  return segments
    .map((segment) =>
      segment.highlighted
        ? `${wrapper.open}${segment.text}${wrapper.close}`
        : segment.text
    )
    .join('');
}

export type { FuzzySearchOptions, FuzzySearchResult, FuzzyMatch, HighlightSegment };
