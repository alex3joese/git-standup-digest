const { renderScoreBar, formatImpactReport, handleImpactCommand } = require('./impactCommand');

const today = new Date().toISOString().split('T')[0];

function makeCommit(overrides = {}) {
  return { hash: 'abc123', message: 'fix: something', date: today, repo: 'repo-a', ...overrides };
}

describe('renderScoreBar', () => {
  it('returns a string of length 22 (brackets + 20 chars)', () => {
    expect(renderScoreBar(30).length).toBe(22);
  });

  it('full bar for score >= max', () => {
    expect(renderScoreBar(60, 60)).toBe('[' + '█'.repeat(20) + ']');
  });

  it('empty bar for score 0', () => {
    expect(renderScoreBar(0, 60)).toBe('[' + '░'.repeat(20) + ']');
  });
});

describe('formatImpactReport', () => {
  it('includes header and stats', () => {
    const summary = {
      topCommits: [{ ...makeCommit(), impactScore: 25.5 }],
      averageScore: 25.5,
      totalScore: 25.5,
    };
    const report = formatImpactReport(summary);
    expect(report).toContain('Impact Report');
    expect(report).toContain('25.5');
  });

  it('shows fallback when no commits', () => {
    const report = formatImpactReport({ topCommits: [], averageScore: 0, totalScore: 0 });
    expect(report).toContain('no commits found');
  });

  it('respects limit option', () => {
    const commits = Array.from({ length: 10 }, (_, i) =>
      ({ ...makeCommit({ message: `feat: thing ${i}` }), impactScore: i + 1 })
    );
    const report = formatImpactReport({ topCommits: commits, averageScore: 5, totalScore: 50 }, { limit: 3 });
    const lines = report.split('\n').filter(l => /^\s+\d+\./.test(l));
    expect(lines.length).toBe(3);
  });
});

describe('handleImpactCommand', () => {
  it('prints report and returns summary', () => {
    const out = jest.fn();
    const commits = [makeCommit(), makeCommit({ message: 'feat!: big thing' })];
    const result = handleImpactCommand(commits, {}, out);
    expect(out).toHaveBeenCalled();
    expect(result).toHaveProperty('averageScore');
    expect(result).toHaveProperty('topCommits');
  });

  it('handles empty commits gracefully', () => {
    const out = jest.fn();
    handleImpactCommand([], {}, out);
    expect(out).toHaveBeenCalledWith('No commits to analyse.');
  });

  it('handles null commits gracefully', () => {
    const out = jest.fn();
    handleImpactCommand(null, {}, out);
    expect(out).toHaveBeenCalledWith('No commits to analyse.');
  });
});
