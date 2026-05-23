const {
  commitMatchesKeyword,
  commitMatchesPath,
  excludeByPattern,
  filterCommits,
} = require('./commitFilter');

const makeCommit = (message, files = []) => ({ message, files });

describe('commitMatchesKeyword', () => {
  it('returns true when no keywords provided', () => {
    expect(commitMatchesKeyword(makeCommit('fix: bug'), [])).toBe(true);
  });

  it('returns true when message includes keyword (case-insensitive)', () => {
    expect(commitMatchesKeyword(makeCommit('Fix: Login Bug'), ['login'])).toBe(true);
  });

  it('returns false when message does not include any keyword', () => {
    expect(commitMatchesKeyword(makeCommit('chore: cleanup'), ['feat', 'fix'])).toBe(false);
  });

  it('matches any one of multiple keywords', () => {
    expect(commitMatchesKeyword(makeCommit('feat: add dashboard'), ['dashboard', 'login'])).toBe(true);
  });
});

describe('commitMatchesPath', () => {
  it('returns true when no pathFilter provided', () => {
    expect(commitMatchesPath(makeCommit('x', ['src/foo.js']), '')).toBe(true);
  });

  it('returns true when a file matches the path filter', () => {
    expect(commitMatchesPath(makeCommit('x', ['src/auth/login.js', 'src/app.js']), 'auth')).toBe(true);
  });

  it('returns false when no files match the path filter', () => {
    expect(commitMatchesPath(makeCommit('x', ['src/app.js']), 'auth')).toBe(false);
  });

  it('returns false when files array is empty', () => {
    expect(commitMatchesPath(makeCommit('x', []), 'src')).toBe(false);
  });
});

describe('excludeByPattern', () => {
  it('returns all commits when no patterns given', () => {
    const commits = [makeCommit('feat: x'), makeCommit('Merge branch main')];
    expect(excludeByPattern(commits, [])).toHaveLength(2);
  });

  it('excludes commits matching any pattern', () => {
    const commits = [makeCommit('feat: x'), makeCommit('Merge branch main'), makeCommit('chore: lint')];
    const result = excludeByPattern(commits, ['merge', 'chore']);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe('feat: x');
  });
});

describe('filterCommits', () => {
  const commits = [
    makeCommit('feat: add login', ['src/auth/login.js']),
    makeCommit('chore: update deps', ['package.json']),
    makeCommit('fix: auth token', ['src/auth/token.js']),
    makeCommit('Merge branch dev', []),
  ];

  it('returns all commits with no options', () => {
    expect(filterCommits(commits, {})).toHaveLength(4);
  });

  it('filters by keyword', () => {
    const result = filterCommits(commits, { keywords: ['auth'] });
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe('fix: auth token');
  });

  it('filters by path and excludes patterns together', () => {
    const result = filterCommits(commits, { pathFilter: 'auth', exclude: ['merge'] });
    expect(result).toHaveLength(2);
  });
});
