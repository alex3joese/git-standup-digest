const {
  extractSubject,
  truncateSubject,
  annotateWithSubjects,
  buildSubjectList,
  formatSubjectDigest
} = require('./commitFirstLines');

describe('extractSubject', () => {
  it('returns first line of multi-line message', () => {
    expect(extractSubject('fix: typo\n\ndetails here')).toBe('fix: typo');
  });

  it('returns full message if single line', () => {
    expect(extractSubject('add feature')).toBe('add feature');
  });

  it('returns empty string for falsy input', () => {
    expect(extractSubject('')).toBe('');
    expect(extractSubject(null)).toBe('');
  });
});

describe('truncateSubject', () => {
  it('returns subject unchanged if within limit', () => {
    expect(truncateSubject('short message', 72)).toBe('short message');
  });

  it('truncates and appends ellipsis if over limit', () => {
    const long = 'a'.repeat(80);
    const result = truncateSubject(long, 72);
    expect(result.length).toBe(72);
    expect(result.endsWith('…')).toBe(true);
  });

  it('uses default max of 72', () => {
    const long = 'b'.repeat(100);
    expect(truncateSubject(long).length).toBe(72);
  });
});

describe('annotateWithSubjects', () => {
  it('adds subject field to each commit', () => {
    const commits = [
      { hash: 'abc', message: 'feat: new thing\n\nbody' },
      { hash: 'def', message: 'fix: bug' }
    ];
    const result = annotateWithSubjects(commits);
    expect(result[0].subject).toBe('feat: new thing');
    expect(result[1].subject).toBe('fix: bug');
  });

  it('preserves other commit fields', () => {
    const commits = [{ hash: 'abc', message: 'msg', author: 'Alice' }];
    expect(annotateWithSubjects(commits)[0].author).toBe('Alice');
  });
});

describe('buildSubjectList', () => {
  it('returns unique subjects in order', () => {
    const commits = [
      { message: 'fix: a' },
      { message: 'fix: b' },
      { message: 'fix: a' }
    ];
    expect(buildSubjectList(commits)).toEqual(['fix: a', 'fix: b']);
  });

  it('returns empty array for empty input', () => {
    expect(buildSubjectList([])).toEqual([]);
  });
});

describe('formatSubjectDigest', () => {
  it('formats numbered list', () => {
    const result = formatSubjectDigest(['fix: a', 'feat: b']);
    expect(result).toContain('1. fix: a');
    expect(result).toContain('2. feat: b');
  });

  it('returns placeholder for empty list', () => {
    expect(formatSubjectDigest([])).toBe('(no commits)');
  });
});
