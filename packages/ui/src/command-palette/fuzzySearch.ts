/**
 * Fuzzy Search Utility
 *
 * Fast fuzzy string matching for command palette search.
 */

import type { PaletteCommand, CommandSearchResult } from './types';

/**
 * Calculate fuzzy match score between query and target string.
 * Returns score (0-1) and matched character indices.
 */
export function fuzzyMatch(
  query: string,
  target: string
): { score: number; matches: number[] } | null {
  if (!query) {
    return { score: 1, matches: [] };
  }

  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  // Quick check: all query chars must exist in target
  let checkIdx = 0;
  for (const char of queryLower) {
    checkIdx = targetLower.indexOf(char, checkIdx);
    if (checkIdx === -1) return null;
    checkIdx++;
  }

  // Find best match with scoring
  const matches: number[] = [];
  let score = 0;
  let queryIdx = 0;
  let prevMatchIdx = -1;
  let consecutive = 0;

  for (let i = 0; i < targetLower.length && queryIdx < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIdx]) {
      matches.push(i);

      // Scoring factors:
      // 1. Position bonus (early matches are better)
      const positionBonus = 1 - i / targetLower.length;
      score += positionBonus * 0.3;

      // 2. Consecutive bonus
      if (prevMatchIdx === i - 1) {
        consecutive++;
        score += consecutive * 0.2;
      } else {
        consecutive = 0;
      }

      // 3. Word boundary bonus (after space, dash, underscore, or case change)
      if (i === 0 || /[\s\-_]/.test(target[i - 1])) {
        score += 0.3;
      } else if (
        target[i] === target[i].toUpperCase() &&
        target[i - 1] === target[i - 1].toLowerCase()
      ) {
        score += 0.2; // camelCase boundary
      }

      // 4. Exact case match bonus
      if (target[i] === query[queryIdx]) {
        score += 0.1;
      }

      prevMatchIdx = i;
      queryIdx++;
    }
  }

  // All query characters must match
  if (queryIdx !== queryLower.length) {
    return null;
  }

  // Normalize score
  const maxPossibleScore = queryLower.length * 0.9;
  const normalizedScore = Math.min(1, score / maxPossibleScore);

  // Length penalty (shorter targets preferred for same match)
  const lengthBonus = queryLower.length / targetLower.length;
  const finalScore = normalizedScore * 0.7 + lengthBonus * 0.3;

  return { score: Math.min(1, finalScore), matches };
}

/**
 * Search commands with fuzzy matching.
 * Matches against title, subtitle, and keywords.
 */
export function searchCommands(
  commands: PaletteCommand[],
  query: string
): CommandSearchResult[] {
  if (!query.trim()) {
    // Return all commands sorted by priority
    return commands.map((command) => ({
      command,
      score: command.priority ?? 0,
      matches: [],
    }));
  }

  const results: CommandSearchResult[] = [];

  for (const command of commands) {
    if (command.disabled) continue;

    let bestScore = 0;
    let bestMatches: number[] = [];

    // Match against title (highest weight)
    const titleMatch = fuzzyMatch(query, command.title);
    if (titleMatch && titleMatch.score > bestScore) {
      bestScore = titleMatch.score;
      bestMatches = titleMatch.matches;
    }

    // Match against subtitle
    if (command.subtitle) {
      const subtitleMatch = fuzzyMatch(query, command.subtitle);
      if (subtitleMatch && subtitleMatch.score * 0.8 > bestScore) {
        bestScore = subtitleMatch.score * 0.8;
        bestMatches = []; // Don't highlight subtitle matches in title
      }
    }

    // Match against keywords
    if (command.keywords) {
      for (const keyword of command.keywords) {
        const keywordMatch = fuzzyMatch(query, keyword);
        if (keywordMatch && keywordMatch.score * 0.7 > bestScore) {
          bestScore = keywordMatch.score * 0.7;
          bestMatches = [];
        }
      }
    }

    // Check for exact ID match (useful for programmatic selection)
    if (command.id.toLowerCase() === query.toLowerCase()) {
      bestScore = 1;
    }

    if (bestScore > 0) {
      // Apply priority boost
      const priorityBoost = (command.priority ?? 0) * 0.1;
      results.push({
        command,
        score: Math.min(1, bestScore + priorityBoost),
        matches: bestMatches,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Group search results by category
 */
export function groupResultsByCategory(
  results: CommandSearchResult[]
): Map<string, CommandSearchResult[]> {
  const groups = new Map<string, CommandSearchResult[]>();

  for (const result of results) {
    const category = result.command.category;
    const existing = groups.get(category) ?? [];
    existing.push(result);
    groups.set(category, existing);
  }

  return groups;
}

/**
 * Evaluate math expression for calculation commands
 */
export function evaluateMathExpression(expr: string): string | null {
  // Only evaluate if it looks like a math expression
  if (!/^[\d\s+\-*/().%^]+$/.test(expr)) {
    return null;
  }

  try {
    // Replace ^ with ** for exponentiation
    const sanitized = expr.replace(/\^/g, '**');

    // Use Function constructor for safer eval
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${sanitized})`)();

    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      // Format nicely
      if (Number.isInteger(result)) {
        return result.toLocaleString();
      }
      return result.toLocaleString(undefined, {
        maximumFractionDigits: 10,
      });
    }
  } catch {
    // Invalid expression
  }

  return null;
}
