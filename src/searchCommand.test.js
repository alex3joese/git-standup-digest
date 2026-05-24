const { formatSearchResult, printSearchResults } = require('./searchCommand');

const commit = {
  hash: 'abc123',
  message: 'fix: correct off-by-one error',
  author: 'Alice',
  repo: 'api',
  date: '2024-06-01T10:00:00Z',
};

describe('formatSearchResult', () => {
  test('includes date, repo, author, and message', () => {
    const line = formatSearchResult(commit, null);
    expect(line).toContain('2024-06-01');
    expect(line).toContain('[api]');
    expect(line).toContain('Alice');
    expect(line).toContain('fix: correct off-by-one error');
  });

  test('highlights keyword when provided', () => {
    const line = formatSearchResult(commit, 'fix');
    expect(line).toContain('\x1b[33m');
  });

  test('handles missing repo gracefully', () => {
    const c = { ...commit, repo: null };
    const line = formatSearchResult(c, null);
    expect(line).not.toContain('[');
    expect(line).toContain('Alice');
  });

  test('handles missing date gracefully', () => {
    const c = { ...commit, date: null };
    const line = formatSearchResult(c, null);
    expect(line).toContain('????-??-??');
  });
});

describe('printSearchResults', () => {
  let spy;
  beforeEach(() => { spy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => spy.mockRestore());

  test('prints no-match message for empty results', () => {
    printSearchResults([], null);
    expect(spy).toHaveBeenCalledWith('No commits matched your search.');
  });

  test('prints count and results', () => {
    printSearchResults([commit], 'fix');
    const calls = spy.mock.calls.map(c => c[0]);
    expect(calls.some(c => typeof c === 'string' && c.includes('1 commit'))).toBe(true);
  });

  test('prints multiple results', () => {
    const commits = [commit, { ...commit, hash: 'def456', message: 'chore: cleanup' }];
    printSearchResults(commits, null);
    const calls = spy.mock.calls.map(c => c[0]);
    expect(calls.some(c => typeof c === 'string' && c.includes('2 commit'))).toBe(true);
  });
});
