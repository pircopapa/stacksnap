const mockTemplateExists = jest.fn();
const mockGetTemplatesDir = jest.fn();
const mockCreateWriteStream = jest.fn();

jest.mock('../templates', () => ({ templateExists: mockTemplateExists }));
jest.mock('../config', () => ({ getTemplatesDir: mockGetTemplatesDir }));
jest.mock('archiver', () =>
  jest.fn(() => ({
    pipe: jest.fn(),
    directory: jest.fn(),
    finalize: jest.fn(),
    on: jest.fn(),
  }))
);

const fs = require('fs');
const path = require('path');
const { handler, builder } = require('./archive');

const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetTemplatesDir.mockResolvedValue('/templates');
});

test('exits if template does not exist', async () => {
  mockTemplateExists.mockResolvedValue(false);
  await handler({ name: 'ghost', output: '/out' });
  expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('not found'));
  expect(mockExit).toHaveBeenCalledWith(1);
});

test('builder defines expected options', () => {
  const yargs = { positional: jest.fn().mockReturnThis(), option: jest.fn().mockReturnThis() };
  builder(yargs);
  expect(yargs.positional).toHaveBeenCalledWith('name', expect.any(Object));
  expect(yargs.option).toHaveBeenCalledWith('output', expect.any(Object));
});

test('createZip returns a promise', () => {
  const { createZip } = require('./archive');
  const EventEmitter = require('events');
  const fakeStream = new EventEmitter();
  jest.spyOn(fs, 'createWriteStream').mockReturnValue(fakeStream);
  const p = createZip('/src', '/out/file.zip');
  expect(p).toBeInstanceOf(Promise);
});
