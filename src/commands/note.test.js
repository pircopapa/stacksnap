const mockTemplateExists = jest.fn();
const mockAddNote = jest.fn();
const mockRemoveNote = jest.fn();
const mockGetNotes = jest.fn();

jest.mock('../templates', () => ({ templateExists: mockTemplateExists }));
jest.mock('../notes', () => ({
  addNote: mockAddNote,
  removeNote: mockRemoveNote,
  getNotes: mockGetNotes,
}));

const { handler } = require('./note');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

afterEach(() => jest.restoreAllMocks());

test('exits if template does not exist', async () => {
  mockTemplateExists.mockReturnValue(false);
  await expect(handler({ template: 'ghost' })).rejects.toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
});

test('adds a note when --add is provided', async () => {
  mockTemplateExists.mockReturnValue(true);
  mockAddNote.mockReturnValue({ id: 1, text: 'hello', createdAt: '2024-01-01' });
  await handler({ template: 'mytemplate', add: 'hello' });
  expect(mockAddNote).toHaveBeenCalledWith('mytemplate', 'hello');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Note added'));
});

test('removes a note when --remove is provided', async () => {
  mockTemplateExists.mockReturnValue(true);
  mockRemoveNote.mockReturnValue(true);
  await handler({ template: 'mytemplate', remove: 42 });
  expect(mockRemoveNote).toHaveBeenCalledWith('mytemplate', 42);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('removed'));
});

test('exits if remove id not found', async () => {
  mockTemplateExists.mockReturnValue(true);
  mockRemoveNote.mockReturnValue(false);
  await expect(handler({ template: 'mytemplate', remove: 99 })).rejects.toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
});

test('lists notes when no flags provided', async () => {
  mockTemplateExists.mockReturnValue(true);
  mockGetNotes.mockReturnValue([{ id: 1, text: 'a note', createdAt: '2024-01-01' }]);
  await handler({ template: 'mytemplate' });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('a note'));
});

test('shows empty message when no notes exist', async () => {
  mockTemplateExists.mockReturnValue(true);
  mockGetNotes.mockReturnValue([]);
  await handler({ template: 'mytemplate' });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No notes'));
});
