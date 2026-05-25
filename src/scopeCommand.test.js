const { formatScopeRow, formatScopeReport, handleScopeCommand } = require('./scopeCommand');

describe('formatScopeRow', () => {
  it('renders a bar proportional to count', () => {
    const row = formatScopeRow({ scope: 'auth', count: 3, repos: ['app'] });
    expect(row).toContain('auth');
    expect(row).toContain('███');
    expect(row).toContain('[app]');
  });

  it('caps bar at 20 chars', () => {
    const row = formatScopeRow({ scope: 'big', count: 99, repos: [] });
    const bars = row.match(/█+/)[0];
    expect(bars.length).toBe(20);
  });

  it('omits repo list when empty', () => {
    const row = formatScopeRow({ scope: 'ci', count: 1, repos: [] });
    expect(row).not.toContain('[');
  });
});

describe('formatScopeReport', () => {
  it('returns no-commits message for empty summary', () => {
    expect(formatScopeReport([])).toMatch(/No commits/);
  });

  it('formats multiple rows', () => {
    const summary = [
      { scope: 'auth', count: 2, repos: ['app'] },
      { scope: 'ui', count: 1, repos: [] },
    ];
    const report = formatScopeReport(summary);
    expect(report).toContain('auth');
    expect(report).toContain('ui');
  });
});

describe('handleScopeCommand', () => {
  let spy;
  beforeEach(() => { spy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => spy.mockRestore());

  it('prints no-commits message when empty', () => {
    handleScopeCommand([]);
    expect(spy).toHaveBeenCalledWith('No commits to analyze.');
  });

  it('prints report for valid commits', () => {
    const commits = [
      { message: 'feat(auth): login', files: [], repo: 'app' },
      { message: 'fix(auth): bug', files: [], repo: 'app' },
    ];
    handleScopeCommand(commits, { date: '2024-01-15' });
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('auth');
    expect(output).toContain('2024-01-15');
  });
});
