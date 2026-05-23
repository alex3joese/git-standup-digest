const {
  formatScoreBar,
  formatHealthReport,
  groupCommitsByRepo,
  handleHealthCommand,
} = require('./healthCommand');

const makeCommit = (message, repo = 'my-repo') => ({
  hash: 'abc123',
  message,
  repo,
  date: '2024-01-01',
});

describe('formatScoreBar', () => {
  it('renders a full bar for 100', () => {
    const bar = formatScoreBar(100);
    expect(bar).toContain('██████████');
    expect(bar).toContain('100');
  });

  it('renders an empty bar for 0', () => {
    const bar = formatScoreBar(0);
    expect(bar).toContain('░░░░░░░░░░');
    expect(bar).toContain('0');
  });

  it('returns n/a for null score', () => {
    expect(formatScoreBar(null)).toBe('[n/a]');
  });
});

describe('formatHealthReport', () => {
  it('includes repo name and stats', () => {
    const report = { total: 5, mergeCount: 1, vagueCount: 1, score: 73, rating: 'fair' };
    const text = formatHealthReport('my-repo', report);
    expect(text).toContain('my-repo');
    expect(text).toContain('5');
    expect(text).toContain('FAIR');
  });
});

describe('groupCommitsByRepo', () => {
  it('groups commits by repo field', () => {
    const commits = [
      makeCommit('feat: a', 'repo-a'),
      makeCommit('feat: b', 'repo-b'),
      makeCommit('feat: c', 'repo-a'),
    ];
    const grouped = groupCommitsByRepo(commits);
    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped['repo-a']).toHaveLength(2);
    expect(grouped['repo-b']).toHaveLength(1);
  });

  it('uses "unknown" for commits without repo', () => {
    const commits = [{ hash: 'x', message: 'fix', date: '2024-01-01' }];
    const grouped = groupCommitsByRepo(commits);
    expect(grouped['unknown']).toHaveLength(1);
  });
});

describe('handleHealthCommand', () => {
  it('writes no-commits message when empty', () => {
    const chunks = [];
    const output = { write: (s) => chunks.push(s) };
    handleHealthCommand([], { output });
    expect(chunks.join('')).toContain('No commits found');
  });

  it('writes report for each repo', () => {
    const commits = [
      makeCommit('add feature', 'repo-a'),
      makeCommit('wip', 'repo-b'),
    ];
    const chunks = [];
    const output = { write: (s) => chunks.push(s) };
    handleHealthCommand(commits, { output });
    const text = chunks.join('');
    expect(text).toContain('repo-a');
    expect(text).toContain('repo-b');
    expect(text).toContain('2 repo(s)');
  });
});
