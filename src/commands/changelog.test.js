jest.mock('../templates');
jest.mock('../changelog');

const { handler } = require('./changelog');
const { templateExists } = require('../templates');
const { addChangelogEntry, getChangelog, clearChangelog } = require('../changelog');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  process.exit.mockRestore();
});

test('exits if template does not exist', () => {
  templateExists.mockReturnValue(false);
  expect(() => handler({ template: 'nope', add: null, clear: false })).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
});

test('adds a changelog entry', () => {
  templateExists.mockReturnValue(true);
  addChangelogEntry.mockReturnValue({ timestamp: '2024-01-01T00:00:00.000Z', author: 'bob', message: 'init' });
  handler({ template: 'mytemplate', add: 'init', author: 'bob', clear: false });
  expect(addChangelogEntry).toHaveBeenCalledWith('mytemplate', 'init', 'bob');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Entry added'));
});

test('clears the changelog', () => {
  templateExists.mockReturnValue(true);
  handler({ template: 'mytemplate', add: null, author: 'unknown', clear: true });
  expect(clearChangelog).toHaveBeenCalledWith('mytemplate');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('cleared'));
});

test('lists changelog entries', () => {
  templateExists.mockReturnValue(true);
  getChangelog.mockReturnValue([
    { timestamp: '2024-01-01T00:00:00.000Z', author: 'alice', message: 'first entry' }
  ]);
  handler({ template: 'mytemplate', add: null, author: 'unknown', clear: false });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('first entry'));
});

test('shows message when no entries exist', () => {
  templateExists.mockReturnValue(true);
  getChangelog.mockReturnValue([]);
  handler({ template: 'mytemplate', add: null, author: 'unknown', clear: false });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No changelog entries'));
});
