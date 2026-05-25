const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('fs');

const {
  addNote,
  getNote,
  removeNote,
  annotateCommitsWithNotes,
  listNotes,
  loadNotes,
} = require('./commitNotepad');

const FAKE_PATH = path.join(os.homedir(), '.git-standup', 'notepad.json');

beforeEach(() => {
  jest.resetAllMocks();
  fs.existsSync.mockReturnValue(false);
  fs.mkdirSync.mockImplementation(() => {});
  fs.writeFileSync.mockImplementation(() => {});
});

function mockExistingNotes(notes) {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue(JSON.stringify(notes));
}

test('loadNotes returns empty object when file missing', () => {
  expect(loadNotes()).toEqual({});
});

test('loadNotes returns parsed notes', () => {
  mockExistingNotes({ abc123: { note: 'hello', addedAt: '2024-01-01' } });
  expect(loadNotes()).toEqual({ abc123: { note: 'hello', addedAt: '2024-01-01' } });
});

test('addNote saves a note for a hash', () => {
  fs.existsSync.mockReturnValue(false);
  const result = addNote('abc123', 'fixed the bug');
  expect(result.note).toBe('fixed the bug');
  expect(fs.writeFileSync).toHaveBeenCalledWith(FAKE_PATH, expect.stringContaining('abc123'), 'utf8');
});

test('addNote throws if hash missing', () => {
  expect(() => addNote('', 'note')).toThrow('hash and note are required');
});

test('getNote returns null for unknown hash', () => {
  expect(getNote('unknown')).toBeNull();
});

test('getNote returns note for known hash', () => {
  mockExistingNotes({ abc123: { note: 'test note', addedAt: '2024-01-01' } });
  expect(getNote('abc123')).toEqual({ note: 'test note', addedAt: '2024-01-01' });
});

test('removeNote returns false for unknown hash', () => {
  expect(removeNote('nope')).toBe(false);
});

test('removeNote deletes and returns true', () => {
  mockExistingNotes({ abc123: { note: 'hi', addedAt: '2024-01-01' } });
  expect(removeNote('abc123')).toBe(true);
  expect(fs.writeFileSync).toHaveBeenCalled();
});

test('annotateCommitsWithNotes attaches notes', () => {
  mockExistingNotes({ abc123: { note: 'great commit', addedAt: '2024-01-01' } });
  const commits = [{ hash: 'abc123', message: 'feat: stuff' }, { hash: 'def456', message: 'fix: bug' }];
  const result = annotateCommitsWithNotes(commits);
  expect(result[0].note).toBe('great commit');
  expect(result[1].note).toBeUndefined();
});

test('listNotes returns all notes', () => {
  mockExistingNotes({ x: { note: 'a', addedAt: '2024-01-01' } });
  expect(listNotes()).toHaveProperty('x');
});
