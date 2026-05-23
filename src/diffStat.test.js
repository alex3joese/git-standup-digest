const { parseDiffStatLine, formatDiffStat, annotateCommitsWithDiffStat, getCommitDiffStat } = require('./diffStat');

describe('parseDiffStatLine', () => {
  it('parses a full shortstat line', () => {
    const line = ' 3 files changed, 42 insertions(+), 7 deletions(-)';
    expect(parseDiffStatLine(line)).toEqual({ added: 42, removed: 7 });
  });

  it('parses insertions only', () => {
    const line = ' 1 file changed, 5 insertions(+)';
    expect(parseDiffStatLine(line)).toEqual({ added: 5, removed: 0 });
  });

  it('parses deletions only', () => {
    const line = ' 1 file changed, 3 deletions(-)';
    expect(parseDiffStatLine(line)).toEqual({ added: 0, removed: 3 });
  });

  it('returns zeros for empty string', () => {
    expect(parseDiffStatLine('')).toEqual({ added: 0, removed: 0 });
  });

  it('returns zeros for unrecognized format', () => {
    expect(parseDiffStatLine('nothing here')).toEqual({ added: 0, removed: 0 });
  });
});

describe('formatDiffStat', () => {
  it('formats added and removed', () => {
    expect(formatDiffStat({ added: 10, removed: 3 })).toBe('+10 -3');
  });

  it('formats added only', () => {
    expect(formatDiffStat({ added: 5, removed: 0 })).toBe('+5');
  });

  it('formats removed only', () => {
    expect(formatDiffStat({ added: 0, removed: 2 })).toBe('-2');
  });

  it('returns empty string when both are zero', () => {
    expect(formatDiffStat({ added: 0, removed: 0 })).toBe('');
  });
});

describe('annotateCommitsWithDiffStat', () => {
  it('annotates commits with diffStat and diffStatLabel', () => {
    const mockGetStat = jest.fn().mockReturnValue({ added: 8, removed: 2 });
    jest.mock('./diffStat', () => ({
      ...jest.requireActual('./diffStat'),
      getCommitDiffStat: mockGetStat,
    }));

    const commits = [
      { hash: 'abc123', repoPath: '/repo/a', message: 'fix bug' },
      { hash: 'def456', repoPath: '/repo/b', message: 'add feature' },
    ];

    // Use actual implementation but spy on getCommitDiffStat via module boundary
    const actual = require('./diffStat');
    const spy = jest.spyOn(actual, 'getCommitDiffStat').mockReturnValue({ added: 8, removed: 2 });

    const result = actual.annotateCommitsWithDiffStat(commits);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      hash: 'abc123',
      diffStat: { added: 8, removed: 2 },
      diffStatLabel: '+8 -2',
    });
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('handles empty commit list', () => {
    const { annotateCommitsWithDiffStat: fn } = require('./diffStat');
    expect(fn([])).toEqual([]);
  });
});
