const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reminders-test-'));
  jest.resetModules();
  jest.mock('./config', () => ({
    getConfigPath: () => path.join(tmpDir, 'config.json'),
  }));
  mod = require('./reminders');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadReminders returns empty object when no file', () => {
  expect(mod.loadReminders()).toEqual({});
});

test('setReminder adds a reminder for a template', () => {
  mod.setReminder('my-template', 'Update deps', '2099-01-01');
  const reminders = mod.getReminders('my-template');
  expect(reminders).toHaveLength(1);
  expect(reminders[0].message).toBe('Update deps');
  expect(reminders[0].dueDate).toBe('2099-01-01');
});

test('setReminder appends multiple reminders', () => {
  mod.setReminder('tmpl', 'First', '2099-01-01');
  mod.setReminder('tmpl', 'Second', '2099-06-01');
  expect(mod.getReminders('tmpl')).toHaveLength(2);
});

test('getReminders returns empty array for unknown template', () => {
  expect(mod.getReminders('nonexistent')).toEqual([]);
});

test('removeReminder removes by index', () => {
  mod.setReminder('tmpl', 'First', '2099-01-01');
  mod.setReminder('tmpl', 'Second', '2099-06-01');
  const result = mod.removeReminder('tmpl', 0);
  expect(result).toBe(true);
  const remaining = mod.getReminders('tmpl');
  expect(remaining).toHaveLength(1);
  expect(remaining[0].message).toBe('Second');
});

test('removeReminder cleans up empty template key', () => {
  mod.setReminder('tmpl', 'Only one', '2099-01-01');
  mod.removeReminder('tmpl', 0);
  const all = mod.loadReminders();
  expect(all['tmpl']).toBeUndefined();
});

test('removeReminder returns false for bad index', () => {
  mod.setReminder('tmpl', 'msg', '2099-01-01');
  expect(mod.removeReminder('tmpl', 99)).toBe(false);
});

test('getDueReminders returns past-due items', () => {
  mod.setReminder('tmpl', 'Old task', '2000-01-01');
  mod.setReminder('tmpl', 'Future task', '2099-01-01');
  const due = mod.getDueReminders();
  expect(due).toHaveLength(1);
  expect(due[0].message).toBe('Old task');
  expect(due[0].template).toBe('tmpl');
});
