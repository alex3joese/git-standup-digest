const {
  aggregateFileStats,
  topChangedFiles,
  formatFileStatRow,
  buildFileStatsReport,
} = require('./commitFileStats');

function makeCommit(files) {
  return { diffStat: { files } };
}

describe('aggregateFileStats', () => {
  it('returns empty array for commits with no diffStat', () => {
    expect(aggregateFileStats([{ message: 'no diff' }])).toEqual([]);
  });

  it('aggregates additions and deletions per file', () => {
    const commits = [
      makeCommit([{ file: 'src/index.js', additions: 10, deletions: 2 }]),
      makeCommit([{ file: 'src/index.js', additions: 5, deletions: 1 }]),
    ];
    const result = aggregateFileStats(commits);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ file: 'src/index.js', additions: 15, deletions: 3, changes: 2 });
  });

  it('handles multiple distinct files', () => {
    const commits = [
      makeCommit([{ file: 'a.js', additions: 3, deletions: 0 }]),
      makeCommit([{ file: 'b.js', additions: 1, deletions: 1 }]),
    ];
    const result = aggregateFileStats(commits);
    expect(result).toHaveLength(2);
  });

  it('counts changes (commits touching file) correctly', () => {
    const commits = [
      makeCommit([{ file: 'x.js', additions: 1, deletions: 0 }]),
      makeCommit([{ file: 'x.js', additions: 2, deletions: 0 }]),
      makeCommit([{ file: 'x.js', additions: 0, deletions: 1 }]),
    ];
    const result = aggregateFileStats(commits);
    expect(result[0].changes).toBe(3);
  });
});

describe('topChangedFiles', () => {
  it('returns top N files by change count', () => {
    const stats = [
      { file: 'a.js', changes: 1 },
      { file: 'b.js', changes: 5 },
      { file: 'c.js', changes: 3 },
    ];
    const top = topChangedFiles(stats, 2);
    expect(top[0].file).toBe('b.js');
    expect(top[1].file).toBe('c.js');
  });

  it('returns all files if fewer than N exist', () => {
    const stats = [{ file: 'a.js', changes: 1 }];
    expect(topChangedFiles(stats, 5)).toHaveLength(1);
  });
});

describe('formatFileStatRow', () => {
  it('formats a stat row with correct signs', () => {
    const row = formatFileStatRow({ file: 'src/foo.js', additions: 10, deletions: 3, changes: 2 });
    expect(row).toContain('+10');
    expect(row).toContain('-3');
    expect(row).toContain('2 commits');
  });

  it('uses singular commit label when changes is 1', () => {
    const row = formatFileStatRow({ file: 'x.js', additions: 1, deletions: 0, changes: 1 });
    expect(row).toContain('1 commit)');
  });
});

describe('buildFileStatsReport', () => {
  it('returns fallback message when no commits have diffStat', () => {
    expect(buildFileStatsReport([])).toBe('No file stats available.');
  });

  it('returns a report string with header and rows', () => {
    const commits = [
      makeCommit([{ file: 'src/app.js', additions: 5, deletions: 1 }]),
    ];
    const report = buildFileStatsReport(commits, 3);
    expect(report).toContain('Top 1 changed file');
    expect(report).toContain('src/app.js');
  });
});
