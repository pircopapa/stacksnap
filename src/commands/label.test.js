jest.mock('../templates');
jest.mock('../labels');

const { templateExists } = require('../templates');
const { addLabel, removeLabel, getLabels } = require('../labels');
const { handler } = require('./label');

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

test('exits if template not found', () => {
  templateExists.mockReturnValue(false);
  expect(() => handler({ template: 'nope', action: 'list' })).toThrow('exit');
  expect(process.exit).toHaveBeenCalledWith(1);
});

test('list shows labels for template', () => {
  templateExists.mockReturnValue(true);
  getLabels.mockReturnValue(['frontend', 'react']);
  handler({ template: 'tpl', action: 'list' });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('frontend'));
});

test('list shows empty message when no labels', () => {
  templateExists.mockReturnValue(true);
  getLabels.mockReturnValue([]);
  handler({ template: 'tpl', action: 'list' });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No labels'));
});

test('add calls addLabel and logs success', () => {
  templateExists.mockReturnValue(true);
  addLabel.mockReturnValue(true);
  handler({ template: 'tpl', action: 'add', labelName: 'backend' });
  expect(addLabel).toHaveBeenCalledWith('tpl', 'backend');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('added'));
});

test('add logs already-exists when duplicate', () => {
  templateExists.mockReturnValue(true);
  addLabel.mockReturnValue(false);
  handler({ template: 'tpl', action: 'add', labelName: 'backend' });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('already exists'));
});

test('remove calls removeLabel and logs success', () => {
  templateExists.mockReturnValue(true);
  removeLabel.mockReturnValue(true);
  handler({ template: 'tpl', action: 'remove', labelName: 'backend' });
  expect(removeLabel).toHaveBeenCalledWith('tpl', 'backend');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('removed'));
});

test('exits if labelName missing for add', () => {
  templateExists.mockReturnValue(true);
  expect(() => handler({ template: 'tpl', action: 'add', labelName: undefined })).toThrow('exit');
  expect(process.exit).toHaveBeenCalledWith(1);
});
