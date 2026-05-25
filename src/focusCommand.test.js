const { renderFocusBar, formatFocusReport, handleFocusCommand } = require('./focusCommand');

const makeCommit = (message) => ({ message, hash: 'abc', author: 'dev', date: new Date().toISOString() });

describe('renderFocusBar', () => {
  it('renders a full bar for score 100', () => {
    const bar = renderFocusBar(100, 10);
    expect(bar).toBe('[██████████]');
  });

  it('renders an empty bar for score 0', () => {
    const bar = renderFocusBar(0, 10);
    expect(bar).toBe('[░░░░░░░░░░]');
  });

  it('renders a half bar for score 50', () => {
    const bar = renderFocusBar(50, 10);
    expect(bar).toBe('[█████░░░░░]');
  });
});

describe('formatFocusReport', () => {
  it('includes score and label', () => {
    const summary = { score: 80, label: 'Highly Focused', typeCounts: { feat: 4, fix: 1 } };
    const report = formatFocusReport(summary);
    expect(report).toContain('80/100');
    expect(report).toContain('Highly Focused');
  });

  it('lists type counts sorted descending', () => {
    const summary = { score: 60, label: 'Moderately Focused', typeCounts: { fix: 1, feat: 3 } };
    const report = formatFocusReport(summary);
    const featIdx = report.indexOf('feat');
    const fixIdx = report.indexOf('fix');
    expect(featIdx).toBeLessThan(fixIdx);
  });

  it('uses singular commit for count of 1', () => {
    const summary = { score: 100, label: 'Highly Focused', typeCounts: { feat: 1 } };
    const report = formatFocusReport(summary);
    expect(report).toContain('1 commit');
    expect(report).not.toContain('1 commits');
  });
});

describe('handleFocusCommand', () => {
  it('prints no commits message when empty', () => {
    const lines = [];
    handleFocusCommand([], { print: (s) => lines.push(s) });
    expect(lines[0]).toMatch(/no commits/i);
  });

  it('prints the report for valid commits', () => {
    const commits = [makeCommit('feat: a'), makeCommit('feat: b'), makeCommit('fix: c')];
    const lines = [];
    handleFocusCommand(commits, { print: (s) => lines.push(s) });
    const output = lines.join('\n');
    expect(output).toContain('Focus Score');
    expect(output).toContain('feat');
  });

  it('handles null commits gracefully', () => {
    const lines = [];
    handleFocusCommand(null, { print: (s) => lines.push(s) });
    expect(lines[0]).toMatch(/no commits/i);
  });
});
