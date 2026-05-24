const {
  countByAuthor,
  rankAuthors,
  topAuthors,
  formatAuthorRow,
  buildTopAuthorsReport
} = require('./commitTopAuthors');

const makeCommit = (author, message = 'fix: thing') => ({ author, message, hash: Math.random().toString(36).slice(2) });

describe('countByAuthor', () => {
  it('counts commits per author', () => {
    const commits = [makeCommit('Alice'), makeCommit('Bob'), makeCommit('Alice')];
    expect(countByAuthor(commits)).toEqual({ Alice: 2, Bob: 1 });
  });

  it('handles empty array', () => {
    expect(countByAuthor([])).toEqual({});
  });

  it('uses Unknown for missing author', () => {
    const commits = [{ message: 'test' }];
    expect(countByAuthor(commits)).toEqual({ Unknown: 1 });
  });
});

describe('rankAuthors', () => {
  it('sorts by count descending', () => {
    const map = { Alice: 5, Bob: 10, Carol: 3 };
    const result = rankAuthors(map);
    expect(result[0].author).toBe('Bob');
    expect(result[1].author).toBe('Alice');
    expect(result[2].author).toBe('Carol');
  });
});

describe('topAuthors', () => {
  it('returns top N authors with percent', () => {
    const commits = [
      ...Array(6).fill(null).map(() => makeCommit('Alice')),
      ...Array(4).fill(null).map(() => makeCommit('Bob'))
    ];
    const result = topAuthors(commits, 2);
    expect(result).toHaveLength(2);
    expect(result[0].author).toBe('Alice');
    expect(result[0].percent).toBe(60);
    expect(result[1].percent).toBe(40);
  });

  it('returns empty array for no commits', () => {
    expect(topAuthors([])).toEqual([]);
  });

  it('limits to n results', () => {
    const commits = ['A','B','C','D','E','F'].map(a => makeCommit(a));
    expect(topAuthors(commits, 3)).toHaveLength(3);
  });
});

describe('formatAuthorRow', () => {
  it('includes author name, count and percent', () => {
    const row = formatAuthorRow({ author: 'Alice', count: 10, percent: 50 }, 10);
    expect(row).toContain('Alice');
    expect(row).toContain('10 commits');
    expect(row).toContain('50%');
  });
});

describe('buildTopAuthorsReport', () => {
  it('returns no commits message for empty input', () => {
    expect(buildTopAuthorsReport([])).toBe('No commits found.');
  });

  it('returns a string with header and rows', () => {
    const commits = Array(3).fill(null).map(() => makeCommit('Alice'));
    const report = buildTopAuthorsReport(commits);
    expect(report).toContain('Top Authors');
    expect(report).toContain('Alice');
  });
});
