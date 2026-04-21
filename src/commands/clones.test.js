jest.mock('../templates');
jest.mock('../config');

const { listTemplates, loadTemplateMeta } = require('../templates');
const { getTemplatesDir } = require('../config');
const { handler } = require('./clones');

beforeEach(() => {
  jest.clearAllMocks();
});

test('lists all clone relationships when no source given', async () => {
  listTemplates.mockReturnValue(['alpha', 'beta', 'gamma']);
  loadTemplateMeta.mockImplementation((name) => {
    if (name === 'beta') return { name: 'beta', clonedFrom: 'alpha' };
    if (name === 'gamma') return { name: 'gamma', clonedFrom: 'alpha' };
    return { name };
  });
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({});
  expect(logSpy).toHaveBeenCalledWith('Clone relationships:');
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('beta'));
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('gamma'));
  logSpy.mockRestore();
});

test('filters clones by source', async () => {
  listTemplates.mockReturnValue(['alpha', 'beta', 'delta']);
  loadTemplateMeta.mockImplementation((name) => {
    if (name === 'beta') return { clonedFrom: 'alpha' };
    if (name === 'delta') return { clonedFrom: 'other' };
    return {};
  });
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ source: 'alpha' });
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('alpha'));
  const calls = logSpy.mock.calls.flat().join(' ');
  expect(calls).toContain('beta');
  expect(calls).not.toContain('delta');
  logSpy.mockRestore();
});

test('shows message when no clones found', async () => {
  listTemplates.mockReturnValue(['alpha', 'beta']);
  loadTemplateMeta.mockReturnValue({ name: 'alpha' });
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({});
  expect(logSpy).toHaveBeenCalledWith('No cloned templates found.');
  logSpy.mockRestore();
});

test('shows message when no clones match given source', async () => {
  listTemplates.mockReturnValue(['beta']);
  loadTemplateMeta.mockReturnValue({ clonedFrom: 'other' });
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ source: 'alpha' });
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No templates cloned from'));
  logSpy.mockRestore();
});

test('skips templates where loadTemplateMeta throws', async () => {
  listTemplates.mockReturnValue(['broken', 'good']);
  loadTemplateMeta.mockImplementation((name) => {
    if (name === 'broken') throw new Error('bad meta');
    return { clonedFrom: 'origin' };
  });
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({});
  const calls = logSpy.mock.calls.flat().join(' ');
  expect(calls).toContain('good');
  expect(calls).not.toContain('broken');
  logSpy.mockRestore();
});
