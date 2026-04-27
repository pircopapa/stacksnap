let snapshotsMod;
let cmd;
let exitSpy;
let logSpy;
let errorSpy;

beforeEach(() => {
  jest.resetModules();
  snapshotsMod = {
    snapshotExists: jest.fn(),
    deleteSnapshot: jest.fn(),
    listSnapshots: jest.fn(),
  };
  jest.mock('../snapshots', () => snapshotsMod);
  cmd = require('./snapshot-delete');
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('exports command, desc, builder, handler', () => {
  expect(cmd.command).toBeDefined();
  expect(cmd.desc).toBeDefined();
  expect(typeof cmd.builder).toBe('function');
  expect(typeof cmd.handler).toBe('function');
});

test('handler deletes snapshot when it exists', () => {
  snapshotsMod.snapshotExists.mockReturnValue(true);
  cmd.handler({ template: 'my-tpl', snapshot: 'v1', list: false });
  expect(snapshotsMod.deleteSnapshot).toHaveBeenCalledWith('my-tpl', 'v1');
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("'v1' deleted"));
});

test('handler exits with error when snapshot not found', () => {
  snapshotsMod.snapshotExists.mockReturnValue(false);
  expect(() => cmd.handler({ template: 'my-tpl', snapshot: 'ghost', list: false })).toThrow('exit');
  expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("does not exist"));
  expect(exitSpy).toHaveBeenCalledWith(1);
});

test('handler lists snapshots when --list flag is set', () => {
  snapshotsMod.listSnapshots.mockReturnValue(['v1', 'v2']);
  cmd.handler({ template: 'my-tpl', snapshot: undefined, list: true });
  expect(snapshotsMod.listSnapshots).toHaveBeenCalledWith('my-tpl');
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('v1'));
});

test('handler prints message when no snapshots exist and --list is set', () => {
  snapshotsMod.listSnapshots.mockReturnValue([]);
  cmd.handler({ template: 'my-tpl', snapshot: undefined, list: true });
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No snapshots found'));
});
