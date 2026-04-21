const mockGetTemplatesDir = jest.fn();
jest.mock('../config', () => ({ getTemplatesDir: mockGetTemplatesDir }));
jest.mock('unzipper', () => ({
  Extract: jest.fn(() => ({ promise: jest.fn().mockResolvedValue() })),
}));

const fs = require('fs');
const { handler, builder } = require('./unarchive');

const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetTemplatesDir.mockResolvedValue('/templates');
});

test('exits when archive file not found', async () => {
  jest.spyOn(fs, 'existsSync').mockReturnValue(false);
  await handler({ file: '/missing.zip', name: undefined });
  expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('not found'));
  expect(mockExit).toHaveBeenCalledWith(1);
});

test('exits when template already exists', async () => {
  jest.spyOn(fs, 'existsSync').mockImplementation((p) => true);
  await handler({ file: '/some/react.zip', name: undefined });
  expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('already exists'));
  expect(mockExit).toHaveBeenCalledWith(1);
});

test('builder defines file positional and name option', () => {
  const yargs = { positional: jest.fn().mockReturnThis(), option: jest.fn().mockReturnThis() };
  builder(yargs);
  expect(yargs.positional).toHaveBeenCalledWith('file', expect.any(Object));
  expect(yargs.option).toHaveBeenCalledWith('name', expect.any(Object));
});

test('uses zip basename as template name when --name omitted', async () => {
  jest.spyOn(fs, 'existsSync').mockImplementation((p) => p.endsWith('.zip'));
  jest.spyOn(fs.promises, 'mkdir').mockResolvedValue();
  jest.spyOn(fs, 'createReadStream').mockReturnValue({ pipe: () => ({ promise: jest.fn().mockResolvedValue() }) });
  await handler({ file: '/archives/mytemplate.zip', name: undefined });
  expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('mytemplate'));
});
