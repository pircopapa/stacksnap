const { handler } = require('./badge');

const mockGetBadges = jest.fn();
const mockAddBadge = jest.fn();
const mockRemoveBadge = jest.fn();
const mockClearBadges = jest.fn();
const mockSearchByBadge = jest.fn();
const mockTemplateExists = jest.fn();

jest.mock('../badges', () => ({
  getBadges: (...a) => mockGetBadges(...a),
  addBadge: (...a) => mockAddBadge(...a),
  removeBadge: (...a) => mockRemoveBadge(...a),
  clearBadges: (...a) => mockClearBadges(...a),
  searchByBadge: (...a) => mockSearchByBadge(...a),
}));

jest.mock('../templates', () => ({
  templateExists: (...a) => mockTemplateExists(...a),
}));

beforeEach(() => jest.clearAllMocks());

test('list shows badges', async () => {
  mockTemplateExists.mockReturnValue(true);
  mockGetBadges.mockReturnValue(['featured', 'new']);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ action: 'list', template: 'tmpl' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('featured'));
  spy.mockRestore();
});

test('add calls addBadge', async () => {
  mockTemplateExists.mockReturnValue(true);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ action: 'add', template: 'tmpl', badge: 'hot' });
  expect(mockAddBadge).toHaveBeenCalledWith('tmpl', 'hot');
  spy.mockRestore();
});

test('remove calls removeBadge', async () => {
  mockTemplateExists.mockReturnValue(true);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ action: 'remove', template: 'tmpl', badge: 'hot' });
  expect(mockRemoveBadge).toHaveBeenCalledWith('tmpl', 'hot');
  spy.mockRestore();
});

test('clear calls clearBadges', async () => {
  mockTemplateExists.mockReturnValue(true);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ action: 'clear', template: 'tmpl' });
  expect(mockClearBadges).toHaveBeenCalledWith('tmpl');
  spy.mockRestore();
});

test('search returns results', async () => {
  mockSearchByBadge.mockReturnValue(['tmpl1', 'tmpl2']);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ action: 'search', template: 'featured' });
  expect(mockSearchByBadge).toHaveBeenCalledWith('featured');
  spy.mockRestore();
});

test('errors on unknown template', async () => {
  mockTemplateExists.mockReturnValue(false);
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await handler({ action: 'add', template: 'nope', badge: 'x' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  spy.mockRestore();
});
