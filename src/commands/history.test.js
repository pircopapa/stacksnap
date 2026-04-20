const { handler, recordUsage } = require('./history');
const { loadConfig, saveConfig } = require('../config');

jest.mock('../config');

describe('history command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows message when history is empty', () => {
    loadConfig.mockReturnValue({ history: [] });
    handler({ clear: false, limit: 10 });
    expect(console.log).toHaveBeenCalledWith('No template usage history found.');
  });

  it('lists recent history entries', () => {
    loadConfig.mockReturnValue({
      history: [
        { template: 'react-app', usedAt: '2024-01-01T10:00:00.000Z' },
        { template: 'node-api', usedAt: '2024-01-02T11:00:00.000Z' },
      ],
    });
    handler({ clear: false, limit: 10 });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Recent template usage'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('react-app'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('node-api'));
  });

  it('clears history when --clear flag is passed', () => {
    loadConfig.mockReturnValue({ history: [{ template: 'react-app', usedAt: '2024-01-01T10:00:00.000Z' }] });
    handler({ clear: true, limit: 10 });
    expect(saveConfig).toHaveBeenCalledWith(expect.objectContaining({ history: [] }));
    expect(console.log).toHaveBeenCalledWith('Usage history cleared.');
  });

  it('respects the limit option', () => {
    const entries = Array.from({ length: 15 }, (_, i) => ({
      template: `template-${i}`,
      usedAt: new Date().toISOString(),
    }));
    loadConfig.mockReturnValue({ history: entries });
    handler({ clear: false, limit: 5 });
    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('template-0');
    expect(calls).not.toContain('template-5');
  });

  it('recordUsage adds entry and deduplicates', () => {
    loadConfig.mockReturnValue({
      history: [{ template: 'react-app', usedAt: '2024-01-01T10:00:00.000Z' }],
    });
    recordUsage('react-app');
    expect(saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        history: expect.arrayContaining([expect.objectContaining({ template: 'react-app' })]),
      })
    );
    const saved = saveConfig.mock.calls[0][0];
    expect(saved.history.filter((h) => h.template === 'react-app')).toHaveLength(1);
  });
});
