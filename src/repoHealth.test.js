const {
  isMergeCommit,
  isVagueCommit,
  countMergeCommits,
  countVagueCommits,
  computeHealthScore,
  buildHealthReport,
} = require('./repoHealth');

const makeCommit = (message) => ({ hash: 'abc123', message, repo: 'test-repo', date: '2024-01-01' });

describe('isMergeCommit', () => {
  it('detects merge branch commits', () => {
    expect(isMergeCommit(makeCommit('Merge branch feature/foo into main'))).toBe(true);
  });
  it('detects merge pull request commits', () => {
    expect(isMergeCommit(makeCommit('Merge pull request #42 from user/branch'))).toBe(true);
  });
  it('returns false for normal commits', () => {
    expect(isMergeCommit(makeCommit('add login feature'))).toBe(false);
  });
});

describe('isVagueCommit', () => {
  it('flags short messages', () => {
    expect(isVagueCommit(makeCommit('fix'))).toBe(true);
  });
  it('flags known vague words', () => {
    expect(isVagueCommit(makeCommit('wip'))).toBe(true);
    expect(isVagueCommit(makeCommit('misc'))).toBe(true);
  });
  it('does not flag descriptive messages', () => {
    expect(isVagueCommit(makeCommit('fix authentication token expiry bug'))).toBe(false);
  });
});

describe('countMergeCommits', () => {
  it('counts correctly', () => {
    const commits = [
      makeCommit('Merge branch main'),
      makeCommit('add feature'),
      makeCommit('Merge pull request #1'),
    ];
    expect(countMergeCommits(commits)).toBe(2);
  });
});

describe('countVagueCommits', () => {
  it('counts correctly', () => {
    const commits = [makeCommit('wip'), makeCommit('add user auth'), makeCommit('temp')];
    expect(countVagueCommits(commits)).toBe(2);
  });
});

describe('computeHealthScore', () => {
  it('returns null for empty commits', () => {
    expect(computeHealthScore([])).toBe(null);
  });
  it('returns 100 for clean commits', () => {
    const commits = [makeCommit('implement oauth login'), makeCommit('refactor database layer')];
    expect(computeHealthScore(commits)).toBe(100);
  });
  it('penalizes vague commits', () => {
    const commits = [makeCommit('wip'), makeCommit('wip'), makeCommit('add feature')];
    expect(computeHealthScore(commits)).toBeLessThan(100);
  });
});

describe('buildHealthReport', () => {
  it('returns correct structure', () => {
    const commits = [makeCommit('add login'), makeCommit('wip'), makeCommit('Merge branch dev')];
    const report = buildHealthReport(commits);
    expect(report).toHaveProperty('total', 3);
    expect(report).toHaveProperty('mergeCount', 1);
    expect(report).toHaveProperty('vagueCount', 1);
    expect(report).toHaveProperty('score');
    expect(['good', 'fair', 'poor']).toContain(report.rating);
  });
});
