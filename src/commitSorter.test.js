const { sortByDate, sortByRepo, sortByMessage, sortByAuthor, sortCommits } = require('./commitSorter');

const commits = [
  { repo: 'zebra-app',  message: 'fix: typo',          author: 'Charlie', date: '2024-06-01T10:00:00Z' },
  { repo: 'alpha-lib',  message: 'feat: add login',     author: 'Alice',   date: '2024-06-03T08:00:00Z' },
  { repo: 'mid-service',message: 'chore: bump deps',    author: 'Bob',     date: '2024-06-02T15:00:00Z' },
];

describe('sortByDate', () => {
  it('sorts descending by default', () => {
    const result = sortByDate(commits);
    expect(result[0].date).toBe('2024-06-03T08:00:00Z');
    expect(result[2].date).toBe('2024-06-01T10:00:00Z');
  });

  it('sorts ascending when specified', () => {
    const result = sortByDate(commits, 'asc');
    expect(result[0].date).toBe('2024-06-01T10:00:00Z');
    expect(result[2].date).toBe('2024-06-03T08:00:00Z');
  });

  it('does not mutate original array', () => {
    const original = [...commits];
    sortByDate(commits);
    expect(commits).toEqual(original);
  });
});

describe('sortByRepo', () => {
  it('sorts alphabetically by repo', () => {
    const result = sortByRepo(commits);
    expect(result[0].repo).toBe('alpha-lib');
    expect(result[1].repo).toBe('mid-service');
    expect(result[2].repo).toBe('zebra-app');
  });
});

describe('sortByMessage', () => {
  it('sorts alphabetically by message', () => {
    const result = sortByMessage(commits);
    expect(result[0].message).toBe('chore: bump deps');
    expect(result[1].message).toBe('feat: add login');
    expect(result[2].message).toBe('fix: typo');
  });
});

describe('sortByAuthor', () => {
  it('sorts alphabetically by author', () => {
    const result = sortByAuthor(commits);
    expect(result[0].author).toBe('Alice');
    expect(result[1].author).toBe('Bob');
    expect(result[2].author).toBe('Charlie');
  });
});

describe('sortCommits', () => {
  it('defaults to date desc', () => {
    const result = sortCommits(commits);
    expect(result[0].date).toBe('2024-06-03T08:00:00Z');
  });

  it('delegates to sortByRepo when field is repo', () => {
    const result = sortCommits(commits, 'repo');
    expect(result[0].repo).toBe('alpha-lib');
  });

  it('delegates to sortByAuthor when field is author', () => {
    const result = sortCommits(commits, 'author');
    expect(result[0].author).toBe('Alice');
  });

  it('handles empty array', () => {
    expect(sortCommits([])).toEqual([]);
  });
});
