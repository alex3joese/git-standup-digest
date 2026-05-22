const { formatDigest, groupByRepo, formatCommitLine } = require('./formatDigest');

const sampleCommits = [
  { repo: 'my-app', message: 'fix login bug', date: '2024-05-10T09:15:00' },
  { repo: 'my-app', message: 'add unit tests', date: '2024-05-10T10:30:00' },
  { repo: 'api-server', message: 'update endpoint docs', date: '2024-05-10T11:00:00' },
];

describe('groupByRepo', () => {
  it('groups commits by repo name', () => {
    const result = groupByRepo(sampleCommits);
    expect(Object.keys(result)).toEqual(['my-app', 'api-server']);
    expect(result['my-app']).toHaveLength(2);
    expect(result['api-server']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByRepo([])).toEqual({});
  });
});

describe('formatCommitLine', () => {
  it('formats a commit with a date', () => {
    const line = formatCommitLine({ message: 'fix bug', date: '2024-05-10T09:15:00' });
    expect(line).toMatch(/^  - fix bug/);
    expect(line).toMatch(/\(\d{2}:\d{2}\)/);
  });

  it('formats a commit without a date', () => {
    const line = formatCommitLine({ message: 'refactor module' });
    expect(line).toBe('  - refactor module');
  });
});

describe('formatDigest', () => {
  it('returns a no-commits message when array is empty', () => {
    expect(formatDigest([])).toBe('No commits found for this period.');
  });

  it('returns a no-commits message when input is null', () => {
    expect(formatDigest(null)).toBe('No commits found for this period.');
  });

  it('includes the date label in the header', () => {
    const result = formatDigest(sampleCommits, { date: '05/10/2024' });
    expect(result).toContain('Standup Digest — 05/10/2024');
  });

  it('includes all repo names', () => {
    const result = formatDigest(sampleCommits, { date: '05/10/2024' });
    expect(result).toContain('my-app');
    expect(result).toContain('api-server');
  });

  it('includes all commit messages', () => {
    const result = formatDigest(sampleCommits, { date: '05/10/2024' });
    expect(result).toContain('fix login bug');
    expect(result).toContain('add unit tests');
    expect(result).toContain('update endpoint docs');
  });
});
