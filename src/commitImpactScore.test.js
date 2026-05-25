const { scoreCommit, recencyMultiplier, annotateCommitsWithImpact, buildImpactSummary } = require('./commitImpactScore');

const today = new Date().toISOString().split('T')[0];

function makeCommit(overrides = {}) {
  return { hash: 'abc123', message: 'fix: bug', date: today, repo: 'my-repo', ...overrides };
}

describe('recencyMultiplier', () => {
  it('returns close to 1 for today', () => {
    expect(recencyMultiplier(today)).toBeGreaterThan(0.9);
  });

  it('returns lower value for old dates', () => {
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(recencyMultiplier(old)).toBeLessThan(0.5);
  });
});

describe('scoreCommit', () => {
  it('returns base score for plain commit', () => {
    const c = makeCommit({ message: 'update stuff' });
    expect(scoreCommit(c)).toBeGreaterThan(0);
  });

  it('adds bonus for breaking change', () => {
    const plain = scoreCommit(makeCommit({ message: 'chore: cleanup' }));
    const breaking = scoreCommit(makeCommit({ message: 'feat!: breaking change' }));
    expect(breaking).toBeGreaterThan(plain);
  });

  it('adds bonus for hotfix keyword', () => {
    const s = scoreCommit(makeCommit({ message: 'hotfix: crash on startup' }));
    expect(s).toBeGreaterThan(15);
  });

  it('accounts for diffStat', () => {
    const withDiff = scoreCommit(makeCommit({ diffStat: { insertions: 100, deletions: 50, filesChanged: 5 } }));
    const noDiff = scoreCommit(makeCommit({}));
    expect(withDiff).toBeGreaterThan(noDiff);
  });
});

describe('annotateCommitsWithImpact', () => {
  it('adds impactScore to each commit', () => {
    const commits = [makeCommit(), makeCommit({ message: 'feat: new thing' })];
    const result = annotateCommitsWithImpact(commits);
    result.forEach(c => expect(typeof c.impactScore).toBe('number'));
  });

  it('does not mutate original commits', () => {
    const commits = [makeCommit()];
    annotateCommitsWithImpact(commits);
    expect(commits[0].impactScore).toBeUndefined();
  });
});

describe('buildImpactSummary', () => {
  it('returns top commits sorted by score', () => {
    const commits = [
      makeCommit({ message: 'chore: lint' }),
      makeCommit({ message: 'feat!: big feature', diffStat: { insertions: 200, deletions: 10, filesChanged: 8 } }),
    ];
    const { topCommits } = buildImpactSummary(commits);
    expect(topCommits[0].impactScore).toBeGreaterThan(topCommits[1]?.impactScore ?? -1);
  });

  it('computes averageScore', () => {
    const commits = [makeCommit(), makeCommit()];
    const { averageScore } = buildImpactSummary(commits);
    expect(typeof averageScore).toBe('number');
  });

  it('returns empty summary for no commits', () => {
    const { topCommits, averageScore } = buildImpactSummary([]);
    expect(topCommits).toHaveLength(0);
    expect(averageScore).toBe(0);
  });
});
