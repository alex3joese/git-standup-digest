const {
  normalizeAuthor,
  commitMatchesAuthor,
  filterByAuthor,
  resolveAuthorFilter,
} = require('./authorFilter');

describe('normalizeAuthor', () => {
  it('lowercases and trims', () => {
    expect(normalizeAuthor('  Alice  ')).toBe('alice');
    expect(normalizeAuthor('BOB')).toBe('bob');
  });

  it('handles empty / null gracefully', () => {
    expect(normalizeAuthor('')).toBe('');
    expect(normalizeAuthor(null)).toBe('');
    expect(normalizeAuthor(undefined)).toBe('');
  });
});

describe('commitMatchesAuthor', () => {
  const commit = { author: 'Alice Smith', email: 'alice@example.com' };

  it('matches by full name (case-insensitive)', () => {
    expect(commitMatchesAuthor(commit, 'Alice Smith')).toBe(true);
    expect(commitMatchesAuthor(commit, 'alice smith')).toBe(true);
  });

  it('matches by partial name', () => {
    expect(commitMatchesAuthor(commit, 'alice')).toBe(true);
  });

  it('matches by email', () => {
    expect(commitMatchesAuthor(commit, 'alice@example.com')).toBe(true);
    expect(commitMatchesAuthor(commit, 'ALICE@EXAMPLE.COM')).toBe(true);
  });

  it('returns false for non-matching author', () => {
    expect(commitMatchesAuthor(commit, 'bob')).toBe(false);
  });

  it('returns true when no filter provided', () => {
    expect(commitMatchesAuthor(commit, null)).toBe(true);
    expect(commitMatchesAuthor(commit, '')).toBe(true);
  });
});

describe('filterByAuthor', () => {
  const commits = [
    { author: 'Alice', email: 'alice@x.com', message: 'feat: a' },
    { author: 'Bob', email: 'bob@x.com', message: 'fix: b' },
    { author: 'Alice', email: 'alice@x.com', message: 'chore: c' },
  ];

  it('filters to only matching commits', () => {
    const result = filterByAuthor(commits, 'alice');
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.author === 'Alice')).toBe(true);
  });

  it('returns all commits when author is null', () => {
    expect(filterByAuthor(commits, null)).toHaveLength(3);
  });

  it('returns empty array when no commits match', () => {
    expect(filterByAuthor(commits, 'carol')).toHaveLength(0);
  });
});

describe('resolveAuthorFilter', () => {
  it('prefers explicit arg over config', () => {
    expect(resolveAuthorFilter('dave', { defaultAuthor: 'alice' })).toBe('dave');
  });

  it('falls back to config defaultAuthor', () => {
    expect(resolveAuthorFilter(null, { defaultAuthor: 'alice' })).toBe('alice');
  });

  it('returns null when neither is set', () => {
    expect(resolveAuthorFilter(null, {})).toBeNull();
    expect(resolveAuthorFilter(null, null)).toBeNull();
  });
});
