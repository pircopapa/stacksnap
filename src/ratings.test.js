const mockRatings = {};
const mockPath = '/mock/config/ratings.json';

jest.mock('./config', () => ({ getConfigPath: () => '/mock/config/config.json' }));
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

const fs = require('fs');
const { setRating, getRating, removeRating, getTopRated, getRatingsPath } = require('./ratings');

beforeEach(() => {
  jest.clearAllMocks();
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue(JSON.stringify(mockRatings));
});

test('getRatingsPath returns correct path', () => {
  expect(getRatingsPath()).toContain('ratings.json');
});

test('getRating returns null when no rating exists', () => {
  fs.readFileSync.mockReturnValue('{}');
  expect(getRating('my-template')).toBeNull();
});

test('setRating saves a valid rating', () => {
  fs.readFileSync.mockReturnValue('{}');
  fs.writeFileSync.mockImplementation(() => {});
  const result = setRating('my-template', 4);
  expect(result.score).toBe(4);
  expect(fs.writeFileSync).toHaveBeenCalled();
});

test('setRating throws on invalid score', () => {
  expect(() => setRating('my-template', 6)).toThrow('Rating must be between 1 and 5');
  expect(() => setRating('my-template', 0)).toThrow('Rating must be between 1 and 5');
});

test('removeRating returns false when template not rated', () => {
  fs.readFileSync.mockReturnValue('{}');
  expect(removeRating('ghost-template')).toBe(false);
});

test('removeRating deletes entry and returns true', () => {
  fs.readFileSync.mockReturnValue(JSON.stringify({ 'my-template': { score: 3, updatedAt: '2024-01-01' } }));
  fs.writeFileSync.mockImplementation(() => {});
  expect(removeRating('my-template')).toBe(true);
  const saved = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
  expect(saved['my-template']).toBeUndefined();
});

test('getTopRated returns sorted list limited by count', () => {
  fs.readFileSync.mockReturnValue(JSON.stringify({
    alpha: { score: 5, updatedAt: '2024-01-01' },
    beta: { score: 2, updatedAt: '2024-01-02' },
    gamma: { score: 4, updatedAt: '2024-01-03' },
  }));
  const top = getTopRated(2);
  expect(top).toHaveLength(2);
  expect(top[0].name).toBe('alpha');
  expect(top[1].name).toBe('gamma');
});
