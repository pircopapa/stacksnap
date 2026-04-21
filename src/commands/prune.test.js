const mockTemplates = ['old-template', 'recent-template', 'never-used'];
const mockConfig = {
  history: [
    { template: 'recent-template', date: new Date().toISOString() },
    { template: 'old-template', date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
  ],
};

jest.mock('../config', () => ({
  getTemplatesDir: () => '/mock/templates',
  loadConfig: () => mockConfig,
}));

jest.mock('../templates', () => ({
  listTemplates: () => mockTemplates,
}));

const fsMock = { rmSync: jest.fn() };
jest.mock('fs', () => fsMock);

const { handler, builder } = require('./prune');

describe('prune command', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    fsMock.rmSync.mockClear();
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it('builder exposes days and dry-run options', () => {
    const yargs = { option: jest.fn().mockReturnThis() };
    builder(yargs);
    expect(yargs.option).toHaveBeenCalledWith('days', expect.objectContaining({ type: 'number' }));
    expect(yargs.option).toHaveBeenCalledWith('dry-run', expect.objectContaining({ type: 'boolean' }));
  });

  it('removes templates unused beyond threshold', async () => {
    await handler({ days: 90, dryRun: false });
    expect(fsMock.rmSync).toHaveBeenCalledTimes(2);
    const removed = fsMock.rmSync.mock.calls.map((c) => c[0]);
    expect(removed.some((p) => p.includes('old-template'))).toBe(true);
    expect(removed.some((p) => p.includes('never-used'))).toBe(true);
  });

  it('does not remove recently used templates', async () => {
    await handler({ days: 90, dryRun: false });
    const removed = fsMock.rmSync.mock.calls.map((c) => c[0]);
    expect(removed.some((p) => p.includes('recent-template'))).toBe(false);
  });

  it('dry run does not call rmSync', async () => {
    await handler({ days: 90, dryRun: true });
    expect(fsMock.rmSync).not.toHaveBeenCalled();
  });

  it('prints message when nothing to prune', async () => {
    await handler({ days: 1, dryRun: false });
    expect(console.log).toHaveBeenCalledWith('No templates eligible for pruning.');
  });
});
