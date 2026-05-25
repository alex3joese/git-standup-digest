jest.mock('./commitNotepad');

const { addNote, getNote, removeNote, listNotes } = require('./commitNotepad');
const { handleNotepadCommand } = require('./notepadCommand');

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  process.exit.mockRestore();
});

test('add subcommand calls addNote and logs result', () => {
  addNote.mockReturnValue({ note: 'fixed auth bug', addedAt: '2024-06-01T00:00:00.000Z' });
  handleNotepadCommand(['add', 'abc123', 'fixed', 'auth', 'bug']);
  expect(addNote).toHaveBeenCalledWith('abc123', 'fixed auth bug');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('fixed auth bug'));
});

test('add subcommand exits if hash missing', () => {
  expect(() => handleNotepadCommand(['add'])).toThrow('exit');
  expect(process.exit).toHaveBeenCalledWith(1);
});

test('get subcommand prints note when found', () => {
  getNote.mockReturnValue({ note: 'important', addedAt: '2024-06-01T00:00:00.000Z' });
  handleNotepadCommand(['get', 'abc123']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('important'));
});

test('get subcommand prints not found message', () => {
  getNote.mockReturnValue(null);
  handleNotepadCommand(['get', 'abc123']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No note found'));
});

test('get subcommand exits if hash missing', () => {
  expect(() => handleNotepadCommand(['get'])).toThrow('exit');
});

test('remove subcommand logs success', () => {
  removeNote.mockReturnValue(true);
  handleNotepadCommand(['remove', 'abc123']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('removed'));
});

test('remove subcommand logs not found', () => {
  removeNote.mockReturnValue(false);
  handleNotepadCommand(['remove', 'abc123']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No note found'));
});

test('list subcommand prints table of notes', () => {
  listNotes.mockReturnValue({
    abc1234567: { note: 'remember this', addedAt: '2024-06-01T00:00:00.000Z' },
  });
  handleNotepadCommand(['list']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('remember this'));
});

test('list subcommand prints empty message', () => {
  listNotes.mockReturnValue({});
  handleNotepadCommand(['list']);
  expect(console.log).toHaveBeenCalledWith('No notes saved.');
});

test('unknown subcommand prints help', () => {
  handleNotepadCommand(['unknown']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('subcommands'));
});
