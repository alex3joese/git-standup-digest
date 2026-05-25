const { handleScopeCommand } = require('./scopeCommand');
const { buildScopeSummary } = require('./commitScopeAnalyzer');

const sampleCommits = [
  { message: 'feat(auth): add OAuth', files: ['src/auth/oauth.js'], repo: 'api' },
  { message: 'fix(auth): token refresh', files: ['src/auth/token.js'], repo: 'api' },
  { message: 'feat(ui): new dashboard', files: ['src/ui/dashboard.jsx'], repo: 'web' },
  { message: 'chore(ci): update workflow', files: ['.github/workflows/ci.yml'], repo: 'api' },
  { message: 'refactor stuff', files: ['src/utils/helpers.js'], repo: 'lib' },
];

describe('scope command integration', () => {
  let spy;
  beforeEach(() => { spy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => spy.mockRestore());

  it('builds correct summary from real commit shapes', () => {
    const summary = buildScopeSummary(sampleCommits);
    const scopes = summary.map(s => s.scope);
    expect(scopes).toContain('auth');
    expect(scopes).toContain('ui');
    expect(scopes).toContain('ci');
    const auth = summary.find(s => s.scope === 'auth');
    expect(auth.count).toBe(2);
  });

  it('auth scope is ranked first', () => {
    const summary = buildScopeSummary(sampleCommits);
    expect(summary[0].scope).toBe('auth');
  });

  it('infers scope from file path when no explicit scope', () => {
    const summary = buildScopeSummary(sampleCommits);
    const utils = summary.find(s => s.scope === 'src/utils');
    expect(utils).toBeDefined();
    expect(utils.count).toBe(1);
  });

  it('handleScopeCommand runs without error on sample commits', () => {
    expect(() => handleScopeCommand(sampleCommits, { date: '2024-06-01' })).not.toThrow();
  });

  it('output includes expected scope names', () => {
    handleScopeCommand(sampleCommits);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('auth');
    expect(output).toContain('ui');
  });
});
