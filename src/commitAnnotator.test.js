const {
  isBreakingChange,
  isHotfix,
  isWip,
  isFirstCommitOfDay,
  buildAnnotations,
  annotateCommits,
} = require('./commitAnnotator');

const base = { hash: 'abc', date: '2024-01-10T09:00:00', repo: 'myrepo' };

describe('isBreakingChange', () => {
  it('detects BREAKING CHANGE in message', () => {
    expect(isBreakingChange({ ...base, message: 'feat!: remove api' })).toBe(true);
  });
  it('detects breaking change keyword', () => {
    expect(isBreakingChange({ ...base, message: 'Breaking Change: drop support' })).toBe(true);
  });
  it('returns false for normal commit', () => {
    expect(isBreakingChange({ ...base, message: 'fix: minor bug' })).toBe(false);
  });
});

describe('isHotfix', () => {
  it('detects hotfix in message', () => {
    expect(isHotfix({ ...base, message: 'hotfix: patch null pointer' })).toBe(true);
  });
  it('detects critical keyword', () => {
    expect(isHotfix({ ...base, message: 'critical: fix login crash' })).toBe(true);
  });
  it('returns false for normal commit', () => {
    expect(isHotfix({ ...base, message: 'chore: update deps' })).toBe(false);
  });
});

describe('isWip', () => {
  it('detects WIP prefix', () => {
    expect(isWip({ ...base, message: 'WIP: draft feature' })).toBe(true);
  });
  it('detects [wip] tag', () => {
    expect(isWip({ ...base, message: '[wip] still in progress' })).toBe(true);
  });
  it('returns false otherwise', () => {
    expect(isWip({ ...base, message: 'feat: add login' })).toBe(false);
  });
});

describe('isFirstCommitOfDay', () => {
  const commits = [
    { hash: 'a1', date: '2024-01-10T08:00:00' },
    { hash: 'a2', date: '2024-01-10T10:00:00' },
    { hash: 'a3', date: '2024-01-11T09:00:00' },
  ];
  it('identifies earliest commit of the day', () => {
    expect(isFirstCommitOfDay(commits[0], commits)).toBe(true);
  });
  it('returns false for later commit same day', () => {
    expect(isFirstCommitOfDay(commits[1], commits)).toBe(false);
  });
  it('identifies first commit of a different day', () => {
    expect(isFirstCommitOfDay(commits[2], commits)).toBe(true);
  });
});

describe('annotateCommits', () => {
  it('adds annotations array to each commit', () => {
    const commits = [
      { hash: 'x1', date: '2024-01-10T09:00:00', message: 'hotfix: crash fix', repo: 'r' },
      { hash: 'x2', date: '2024-01-10T11:00:00', message: 'feat: new thing', repo: 'r' },
    ];
    const result = annotateCommits(commits);
    expect(result[0].annotations).toContain('hotfix');
    expect(result[0].annotations).toContain('first-of-day');
    expect(result[1].annotations).not.toContain('first-of-day');
  });
});
