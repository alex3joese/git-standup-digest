const { buildSearchPredicate, searchCommits, highlightKeyword } = require('./commitSearch');

const commits = [
  { hash: 'aaa', message: 'fix: resolve login bug', author: 'Alice', repo: 'api', date: '2024-06-01T10:00:00Z' },
  { hash: 'bbb', message: 'feat: add dashboard', author: 'Bob', repo: 'frontend', date: '2024-06-02T09:00:00Z' },
  { hash: 'ccc', message: 'chore: update deps', author: 'Alice', repo: 'api', date: '2024-06-03T08:00:00Z' },
  { hash: 'ddd', message: 'fix: null pointer in parser', author: 'Carol', repo: 'parser', date: '2024-06-04T07:00:00Z' },
];

describe('buildSearchPredicate', () => {
  test('returns true for empty query', () => {
    const pred = buildSearchPredicate({});
    expect(commits.every(pred)).toBe(true);
  });

  test('filters by keyword', () => {
    const pred = buildSearchPredicate({ keyword: 'fix' });
    const results = commits.filter(pred);
    expect(results).toHaveLength(2);
    expect(results.map(c => c.hash)).toEqual(['aaa', 'ddd']);
  });

  test('filters by author (case-insensitive)', () => {
    const pred = buildSearchPredicate({ author: 'alice' });
    const results = commits.filter(pred);
    expect(results).toHaveLength(2);
  });

  test('filters by repo', () => {
    const pred = buildSearchPredicate({ repo: 'api' });
    const results = commits.filter(pred);
    expect(results).toHaveLength(2);
  });

  test('filters by since date', () => {
    const pred = buildSearchPredicate({ since: '2024-06-03T00:00:00Z' });
    const results = commits.filter(pred);
    expect(results).toHaveLength(2);
  });

  test('filters by until date', () => {
    const pred = buildSearchPredicate({ until: '2024-06-02T23:59:59Z' });
    const results = commits.filter(pred);
    expect(results).toHaveLength(2);
  });

  test('combines keyword and author', () => {
    const pred = buildSearchPredicate({ keyword: 'fix', author: 'Alice' });
    const results = commits.filter(pred);
    expect(results).toHaveLength(1);
    expect(results[0].hash).toBe('aaa');
  });
});

describe('searchCommits', () => {
  test('returns empty array for non-array input', () => {
    expect(searchCommits(null, {})).toEqual([]);
  });

  test('returns all commits for empty query', () => {
    expect(searchCommits(commits, {})).toHaveLength(4);
  });

  test('filters correctly', () => {
    const results = searchCommits(commits, { keyword: 'chore' });
    expect(results).toHaveLength(1);
    expect(results[0].hash).toBe('ccc');
  });
});

describe('highlightKeyword', () => {
  test('wraps match in ANSI yellow', () => {
    const result = highlightKeyword('fix: resolve login bug', 'fix');
    expect(result).toContain('\x1b[33mfix\x1b[0m');
  });

  test('returns original text if no keyword', () => {
    expect(highlightKeyword('hello world', '')).toBe('hello world');
  });

  test('is case-insensitive', () => {
    const result = highlightKeyword('Fix this now', 'fix');
    expect(result).toContain('\x1b[33mFix\x1b[0m');
  });
});
