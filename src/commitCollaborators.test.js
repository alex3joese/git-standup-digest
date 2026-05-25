const {
  extractCoAuthors,
  buildCollaboratorMap,
  rankByCollaborators,
  formatCollaboratorReport,
} = require('./commitCollaborators');

const makeCommit = (author, message = '') => ({ author, message });

describe('extractCoAuthors', () => {
  it('returns empty array when no co-authors', () => {
    expect(extractCoAuthors('fix: typo')).toEqual([]);
  });

  it('extracts a single co-author', () => {
    const msg = 'feat: thing\n\nCo-authored-by: Jane Doe <jane@example.com>';
    expect(extractCoAuthors(msg)).toEqual(['Jane Doe']);
  });

  it('extracts multiple co-authors', () => {
    const msg = [
      'chore: cleanup',
      '',
      'Co-authored-by: Alice <a@x.com>',
      'Co-authored-by: Bob <b@x.com>',
    ].join('\n');
    const result = extractCoAuthors(msg);
    expect(result).toContain('Alice');
    expect(result).toContain('Bob');
    expect(result).toHaveLength(2);
  });

  it('handles null/undefined message gracefully', () => {
    expect(extractCoAuthors(null)).toEqual([]);
    expect(extractCoAuthors(undefined)).toEqual([]);
  });
});

describe('buildCollaboratorMap', () => {
  it('returns empty map for commits with no co-authors', () => {
    const commits = [makeCommit('Alice', 'fix: bug')];
    const map = buildCollaboratorMap(commits);
    expect(map.get('Alice').size).toBe(0);
  });

  it('links primary author and co-author bidirectionally', () => {
    const commits = [
      makeCommit('Alice', 'feat: x\n\nCo-authored-by: Bob <b@x.com>'),
    ];
    const map = buildCollaboratorMap(commits);
    expect(map.get('Alice').has('Bob')).toBe(true);
    expect(map.get('Bob').has('Alice')).toBe(true);
  });

  it('accumulates collaborators across multiple commits', () => {
    const commits = [
      makeCommit('Alice', 'feat: a\n\nCo-authored-by: Bob <b@x.com>'),
      makeCommit('Alice', 'fix: b\n\nCo-authored-by: Carol <c@x.com>'),
    ];
    const map = buildCollaboratorMap(commits);
    expect(map.get('Alice').size).toBe(2);
  });
});

describe('rankByCollaborators', () => {
  it('sorts by collaborator count descending', () => {
    const map = new Map([
      ['Alice', new Set(['Bob', 'Carol'])],
      ['Bob', new Set(['Alice'])],
    ]);
    const ranked = rankByCollaborators(map);
    expect(ranked[0].author).toBe('Alice');
    expect(ranked[0].count).toBe(2);
  });
});

describe('formatCollaboratorReport', () => {
  it('returns fallback message for empty input', () => {
    expect(formatCollaboratorReport([])).toBe('No collaborator data found.');
  });

  it('includes author and collaborator names', () => {
    const ranked = [{ author: 'Alice', count: 1, collaborators: ['Bob'] }];
    const report = formatCollaboratorReport(ranked);
    expect(report).toContain('Alice');
    expect(report).toContain('Bob');
  });

  it('skips entries with zero collaborators', () => {
    const ranked = [{ author: 'Solo', count: 0, collaborators: [] }];
    const report = formatCollaboratorReport(ranked);
    expect(report).not.toContain('Solo');
  });
});
