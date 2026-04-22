const { getFavorites, addFavorite, removeFavorite, isFavorite } = require('./favorites');
const { loadConfig, saveConfig } = require('./config');

jest.mock('./config');

describe('favorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getFavorites returns empty array when none set', async () => {
    loadConfig.mockResolvedValue({});
    const result = await getFavorites();
    expect(result).toEqual([]);
  });

  test('getFavorites returns existing favorites', async () => {
    loadConfig.mockResolvedValue({ favorites: ['react-app', 'node-api'] });
    const result = await getFavorites();
    expect(result).toEqual(['react-app', 'node-api']);
  });

  test('addFavorite adds a new template', async () => {
    const config = { favorites: [] };
    loadConfig.mockResolvedValue(config);
    saveConfig.mockResolvedValue();
    const result = await addFavorite('react-app');
    expect(result).toBe(true);
    expect(saveConfig).toHaveBeenCalledWith({ favorites: ['react-app'] });
  });

  test('addFavorite returns false if already favorited', async () => {
    loadConfig.mockResolvedValue({ favorites: ['react-app'] });
    const result = await addFavorite('react-app');
    expect(result).toBe(false);
    expect(saveConfig).not.toHaveBeenCalled();
  });

  test('removeFavorite removes an existing favorite', async () => {
    const config = { favorites: ['react-app', 'node-api'] };
    loadConfig.mockResolvedValue(config);
    saveConfig.mockResolvedValue();
    const result = await removeFavorite('react-app');
    expect(result).toBe(true);
    expect(saveConfig).toHaveBeenCalledWith({ favorites: ['node-api'] });
  });

  test('removeFavorite returns false if not in favorites', async () => {
    loadConfig.mockResolvedValue({ favorites: ['node-api'] });
    const result = await removeFavorite('react-app');
    expect(result).toBe(false);
    expect(saveConfig).not.toHaveBeenCalled();
  });

  test('isFavorite returns true for favorited template', async () => {
    loadConfig.mockResolvedValue({ favorites: ['react-app'] });
    expect(await isFavorite('react-app')).toBe(true);
  });

  test('isFavorite returns false for non-favorited template', async () => {
    loadConfig.mockResolvedValue({ favorites: ['node-api'] });
    expect(await isFavorite('react-app')).toBe(false);
  });
});
