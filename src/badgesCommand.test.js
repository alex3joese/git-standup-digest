const { formatBadgesReport, handleBadgesCommand } = require('./badgesCommand');

function makeCommit(overrides = {}) {
  return { hash: 'abc123', message: 'feat: add thing', date: '2024-01-15T10:00:00Z', author: 'Alice', repo: 'proj', ...overrides };
}

describe('formatBadgesReport', () => {
  it('includes commit count', () => {
    const commits = [makeCommit(), makeCommit()];
    const report = formatBadgesReport(commits);
    expect(report).toContain('Commits analysed: 2');
  });

  it('shows no badges for plain commits', () => {
    const report = formatBadgesReport([makeCommit()]);
    expect(report).toContain('no badges');
  });

  it('includes author when provided', () => {
    const report = formatBadgesReport([makeCommit()], { author: 'Alice' });
    expect(report).toContain('Author: Alice');
  });

  it('shows badges count', () => {
    const commits = [
      makeCommit({ message: 'chore: release v1.0', date: '2024-01-15T02:00:00' }),
      ...Array.from({ length: 9 }, () => makeCommit()),
    ];
    const report = formatBadgesReport(commits, { streakLength: 7 });
    expect(report).toMatch(/Badges earned \(\d+\)/);
  });

  it('shows streaker badge for long streak', () => {
    const report = formatBadgesReport([makeCommit()], { streakLength: 8 });
    expect(report).toContain('Streaker');
  });
});

describe('handleBadgesCommand', () => {
  let spy;
  beforeEach(() => { spy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => spy.mockRestore());

  it('prints message when no commits', () => {
    handleBadgesCommand([]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No commits'));
  });

  it('filters by author', () => {
    const commits = [makeCommit({ author: 'Alice' }), makeCommit({ author: 'Bob' })];
    handleBadgesCommand(commits, { author: 'Alice' });
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Author: Alice');
  });

  it('prints header and report for valid commits', () => {
    handleBadgesCommand([makeCommit(), makeCommit()], { since: '2024-01-15' });
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Commit Badges');
    expect(output).toContain('Commits analysed');
  });
});
