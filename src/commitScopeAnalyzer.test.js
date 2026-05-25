const {
  extractScope,
  inferScopeFromFiles,
  resolveScope,
  annotateCommitsWithScope,
  groupByScope,
  buildScopeSummary,
} = require('./commitScopeAnalyzer');

describe('extractScope', () => {
  it('extracts scope from conventional commit', () => {
    expect(extractScope('feat(auth): add login')).toBe('auth');
    expect(extractScope('fix(api): handle null')).toBe('api');
  });
  it('returns null when no scope', () => {
    expect(extractScope('update readme')).toBeNull();
  });
});

describe('inferScopeFromFiles', () => {
  it('returns most common directory', () => {
    const files = ['src/auth/login.js', 'src/auth/logout.js', 'src/api/index.js'];
    expect(inferScopeFromFiles(files)).toBe('src/auth');
  });
  it('returns null for empty list', () => {
    expect(inferScopeFromFiles([])).toBeNull();
  });
  it('returns null for root-level files', () => {
    expect(inferScopeFromFiles(['README.md'])).toBeNull();
  });
});

describe('resolveScope', () => {
  it('prefers explicit scope over inferred', () => {
    const commit = { message: 'feat(cli): add flag', files: ['src/auth/x.js'] };
    expect(resolveScope(commit)).toBe('cli');
  });
  it('falls back to file inference', () => {
    const commit = { message: 'update stuff', files: ['src/db/query.js'] };
    expect(resolveScope(commit)).toBe('src/db');
  });
  it('falls back to general', () => {
    expect(resolveScope({ message: 'misc', files: [] })).toBe('general');
  });
});

describe('groupByScope', () => {
  const commits = [
    { message: 'feat(auth): x', files: [] },
    { message: 'fix(auth): y', files: [] },
    { message: 'chore(ci): z', files: [] },
  ];
  it('groups correctly', () => {
    const groups = groupByScope(commits);
    expect(groups['auth']).toHaveLength(2);
    expect(groups['ci']).toHaveLength(1);
  });
});

describe('buildScopeSummary', () => {
  const commits = [
    { message: 'feat(auth): a', files: [], repo: 'app' },
    { message: 'fix(auth): b', files: [], repo: 'app' },
    { message: 'feat(ui): c', files: [], repo: 'web' },
  ];
  it('returns sorted summary', () => {
    const summary = buildScopeSummary(commits);
    expect(summary[0].scope).toBe('auth');
    expect(summary[0].count).toBe(2);
    expect(summary[1].scope).toBe('ui');
  });
  it('includes repos list', () => {
    const summary = buildScopeSummary(commits);
    expect(summary[0].repos).toContain('app');
  });
});
