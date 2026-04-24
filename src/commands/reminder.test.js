jest.mock('../reminders');
jest.mock('../templates');

const { setReminder, getReminders, removeReminder, getDueReminders } = require('../reminders');
const { templateExists } = require('../templates');
const { handler } = require('./reminder');

beforeEach(() => {
  jest.clearAllMocks();
  templateExists.mockReturnValue(true);
});

test('add reminder calls setReminder', () => {
  setReminder.mockImplementation(() => {});
  handler({ action: 'add', template: 'myapp', message: 'Update deps', due: '2025-12-01' });
  expect(setReminder).toHaveBeenCalledWith('myapp', 'Update deps', '2025-12-01');
});

test('add reminder without message exits with error', () => {
  const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => handler({ action: 'add', template: 'myapp' })).toThrow('exit');
  expect(exit).toHaveBeenCalledWith(1);
  exit.mockRestore();
});

test('list reminders prints each reminder', () => {
  getReminders.mockReturnValue([
    { message: 'Check config', dueDate: '2025-06-01', createdAt: '2025-01-01' },
  ]);
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  handler({ action: 'list', template: 'myapp' });
  expect(log).toHaveBeenCalledWith(expect.stringContaining('Check config'));
  log.mockRestore();
});

test('list reminders shows empty message when none', () => {
  getReminders.mockReturnValue([]);
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  handler({ action: 'list', template: 'myapp' });
  expect(log).toHaveBeenCalledWith(expect.stringContaining('No reminders'));
  log.mockRestore();
});

test('remove reminder calls removeReminder', () => {
  removeReminder.mockReturnValue(true);
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  handler({ action: 'remove', template: 'myapp', index: 0 });
  expect(removeReminder).toHaveBeenCalledWith('myapp', 0);
  log.mockRestore();
});

test('remove reminder without index exits with error', () => {
  const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => handler({ action: 'remove', template: 'myapp' })).toThrow('exit');
  exit.mockRestore();
});

test('due action lists overdue reminders', () => {
  getDueReminders.mockReturnValue([{ template: 'myapp', message: 'Outdated', dueDate: '2024-01-01' }]);
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  handler({ action: 'due' });
  expect(log).toHaveBeenCalledWith(expect.stringContaining('myapp'));
  log.mockRestore();
});

test('exits when template does not exist', () => {
  templateExists.mockReturnValue(false);
  const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => handler({ action: 'list', template: 'ghost' })).toThrow('exit');
  exit.mockRestore();
});
