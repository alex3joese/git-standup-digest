const { handleFocusCommand } = require('./focusCommand');

const makeCommit = (message, daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { message, hash: Math.random().toString(36).slice(2), author: 'alice', date: d.toISOString() };
};

describe('focusCommand integration', () => {
  it('produces a complete report for a realistic commit set', () => {
    const commits = [
      makeCommit('feat: implement OAuth login'),
      makeCommit('feat: add token refresh'),
      makeCommit('feat: user profile page'),
      makeCommit('fix: handle expired tokens'),
      makeCommit('chore: update deps'),
    ];
    const lines = [];
    handleFocusCommand(commits, { print: (s) => lines.push(s) });
    const output = lines.join('\n');
    expect(output).toContain('Focus Score');
    expect(output).toContain('feat');
    expect(output).toContain('fix');
    expect(output).toContain('chore');
  });

  it('shows Highly Focused for all-feat commits', () => {
    const commits = [
      makeCommit('feat: one'),
      makeCommit('feat: two'),
      makeCommit('feat: three'),
    ];
    const lines = [];
    handleFocusCommand(commits, { print: (s) => lines.push(s) });
    const output = lines.join('\n');
    expect(output).toContain('Highly Focused');
    expect(output).toContain('100/100');
  });

  it('shows Scattered for fully diverse commits', () => {
    const commits = [
      makeCommit('feat: a'),
      makeCommit('fix: b'),
      makeCommit('chore: c'),
      makeCommit('docs: d'),
      makeCommit('refactor: e'),
    ];
    const lines = [];
    handleFocusCommand(commits, { print: (s) => lines.push(s) });
    const output = lines.join('\n');
    expect(output).toContain('Scattered');
  });
});
