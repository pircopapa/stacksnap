const { handler, builder } = require('./version');

jest.mock('../templates', () => ({
  templateExists: name => name === 'mytemplate',
}));

const mockAddVersion = jest.fn();
const mockGetVersions = jest.fn();
const mockGetLatestVersion = jest.fn();
const mockRemoveVersion = jest.fn();

jest.mock('../versions', () => ({
  addVersion: (...args) => mockAddVersion(...args),
  getVersions: (...args) => mockGetVersions(...args),
  getLatestVersion: (...args) => mockGetLatestVersion(...args),
  removeVersion: (...args) => mockRemoveVersion(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

afterEach(() => jest.restoreAllMocks());

test('exits if template does not exist', () => {
  expect(() => handler({ template: 'ghost', add: '1.0.0', note: '' })).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
});

test('adds a version', () => {
  mockAddVersion.mockReturnValue({ version: '1.0.0', note: '', createdAt: 'now' });
  handler({ template: 'mytemplate', add: '1.0.0', note: '' });
  expect(mockAddVersion).toHaveBeenCalledWith('mytemplate', '1.0.0', '');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('1.0.0'));
});

test('removes a version', () => {
  mockRemoveVersion.mockReturnValue(true);
  handler({ template: 'mytemplate', remove: '1.0.0' });
  expect(mockRemoveVersion).toHaveBeenCalledWith('mytemplate', '1.0.0');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('removed'));
});

test('exits when removing non-existent version', () => {
  mockRemoveVersion.mockReturnValue(false);
  expect(() => handler({ template: 'mytemplate', remove: '9.9.9' })).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
});

test('shows latest version', () => {
  mockGetLatestVersion.mockReturnValue({ version: '2.0.0', note: 'big', createdAt: 'now' });
  handler({ template: 'mytemplate', latest: true });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('2.0.0'));
});

test('lists all versions', () => {
  mockGetVersions.mockReturnValue([
    { version: '1.0.0', note: '', createdAt: 'then' },
    { version: '1.1.0', note: 'patch', createdAt: 'now' },
  ]);
  handler({ template: 'mytemplate', list: true });
  expect(console.log).toHaveBeenCalledTimes(2);
});

test('shows message when no versions exist on list', () => {
  mockGetVersions.mockReturnValue([]);
  handler({ template: 'mytemplate', list: true });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No versions'));
});
