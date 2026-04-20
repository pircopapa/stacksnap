/**
 * Core stats utilities shared across the stats command and any future reporters.
 */

/**
 * Aggregate history entries into a map of template -> use count.
 * @param {Array<{template: string, date: string}>} history
 * @returns {Record<string, number>}
 */
export function aggregateCounts(history) {
  return history.reduce((acc, entry) => {
    acc[entry.template] = (acc[entry.template] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Find the most recently used template from history.
 * @param {Array<{template: string, date: string}>} history
 * @returns {string|null}
 */
export function mostRecentTemplate(history) {
  if (!history.length) return null;
  return history.slice().sort((a, b) => (a.date < b.date ? 1 : -1))[0].template;
}

/**
 * Return the top N templates by usage count.
 * @param {Record<string, number>} counts
 * @param {number} n
 * @returns {Array<{name: string, uses: number}>}
 */
export function topTemplates(counts, n = 5) {
  return Object.entries(counts)
    .map(([name, uses]) => ({ name, uses }))
    .sort((a, b) => b.uses - a.uses)
    .slice(0, n);
}

/**
 * Compute per-month usage breakdown.
 * @param {Array<{template: string, date: string}>} history
 * @returns {Record<string, number>}  key is 'YYYY-MM'
 */
export function usageByMonth(history) {
  return history.reduce((acc, entry) => {
    const month = entry.date ? entry.date.slice(0, 7) : 'unknown';
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
}
