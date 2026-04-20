import { describe, it, expect } from 'vitest';
import { aggregateCounts, mostRecentTemplate, topTemplates, usageByMonth } from './stats.js';

const sampleHistory = [
  { template: 'react-app', date: '2024-01-05' },
  { template: 'react-app', date: '2024-02-10' },
  { template: 'express-api', date: '2024-01-20' },
  { template: 'vue-app', date: '2024-03-01' },
  { template: 'react-app', date: '2024-03-15' },
];

describe('aggregateCounts', () => {
  it('counts each template correctly', () => {
    const counts = aggregateCounts(sampleHistory);
    expect(counts['react-app']).toBe(3);
    expect(counts['express-api']).toBe(1);
    expect(counts['vue-app']).toBe(1);
  });

  it('returns empty object for empty history', () => {
    expect(aggregateCounts([])).toEqual({});
  });
});

describe('mostRecentTemplate', () => {
  it('returns the most recently used template', () => {
    expect(mostRecentTemplate(sampleHistory)).toBe('react-app');
  });

  it('returns null for empty history', () => {
    expect(mostRecentTemplate([])).toBeNull();
  });
});

describe('topTemplates', () => {
  it('returns top N templates by usage', () => {
    const counts = aggregateCounts(sampleHistory);
    const top = topTemplates(counts, 2);
    expect(top[0].name).toBe('react-app');
    expect(top[0].uses).toBe(3);
    expect(top.length).toBe(2);
  });

  it('defaults to top 5', () => {
    const counts = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };
    expect(topTemplates(counts).length).toBe(5);
  });
});

describe('usageByMonth', () => {
  it('groups usage by month', () => {
    const byMonth = usageByMonth(sampleHistory);
    expect(byMonth['2024-01']).toBe(2);
    expect(byMonth['2024-02']).toBe(1);
    expect(byMonth['2024-03']).toBe(2);
  });

  it('handles missing date gracefully', () => {
    const byMonth = usageByMonth([{ template: 'x', date: null }]);
    expect(byMonth['unknown']).toBe(1);
  });
});
