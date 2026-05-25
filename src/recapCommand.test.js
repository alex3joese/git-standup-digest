'use strict';

const { printRecapHeader, handleRecapCommand } = require('./recapCommand');
const { resolveAuthorFilter } = require('./authorFilter');
const { filterByAuthor } = require('./authorFilter');

jest.mock('./authorFilter', () => ({
  resolveAuthorFilter: jest.fn(),
  filterByAuthor: jest.fn((commits) => commits),
}));

const makeCommit = (repo, message, author = 'Alice') => ({
  repo,
  message,
  date: '2024-05-01T10:00:00Z',
  author,
  hash: Math.random().toString(36).slice(2),
});

describe('printRecapHeader', () => {
  it('prints header without throwing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    expect(() => printRecapHeader('Alice')).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('includes author in output when provided', () => {
    const lines = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((l) => lines.push(l));
    printRecapHeader('Bob');
    expect(lines.some((l) => l && l.includes('Bob'))).toBe(true);
    spy.mockRestore();
  });
});

describe('handleRecapCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls resolveAuthorFilter with args', async () => {
    resolveAuthorFilter.mockResolvedValue('Alice');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const commits = [makeCommit('repo-a', 'feat: thing')];
    await handleRecapCommand(commits, { author: 'Alice' });
    expect(resolveAuthorFilter).toHaveBeenCalledWith({ author: 'Alice' });
    spy.mockRestore();
  });

  it('uses filterByAuthor when author is resolved', async () => {
    resolveAuthorFilter.mockResolvedValue('Alice');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const commits = [makeCommit('repo-a', 'fix: bug', 'Alice')];
    await handleRecapCommand(commits, {});
    expect(filterByAuthor).toHaveBeenCalledWith(commits, 'Alice');
    spy.mockRestore();
  });

  it('skips filterByAuthor when no author resolved', async () => {
    resolveAuthorFilter.mockResolvedValue(null);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const commits = [makeCommit('repo-a', 'chore: cleanup')];
    await handleRecapCommand(commits, {});
    expect(filterByAuthor).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('prints output without throwing on empty commits', async () => {
    resolveAuthorFilter.mockResolvedValue(null);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await expect(handleRecapCommand([], {})).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
