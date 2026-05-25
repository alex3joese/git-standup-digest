/**
 * Integration test: topAuthorsCommand with real commitTopAuthors logic.
 */
const { handleTopAuthorsCommand } = require('./topAuthorsCommand');

const makeCommit = (author, message = 'fix: patch') => ({ author, message, hash: Math.random().toString(36).slice(2) });

/**
 * Helper to capture and join all console.log output from a command invocation.
 */
const getOutput = () => logSpy.mock.calls.map(c => c[0]).join('\n');

let logSpy;
beforeEach(() => { logSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterEach(() => { logSpy.mockRestore(); });

describe('handleTopAuthorsCommand integration', () => {
  it('produces correct ranking from realistic commit set', () => {
    const commits = [
      ...Array(8).fill(null).map(() => makeCommit('Carol')),
      ...Array(5).fill(null).map(() => makeCommit('Dave')),
      ...Array(2).fill(null).map(() => makeCommit('Eve'))
    ];
    handleTopAuthorsCommand(commits, { n: 3 });
    const output = getOutput();
    expect(output).toContain('Carol');
    expect(output).toContain('Dave');
    expect(output).toContain('Eve');
    // Carol should appear before Dave in output
    expect(output.indexOf('Carol')).toBeLessThan(output.indexOf('Dave'));
  });

  it('json output matches expected structure', () => {
    const commits = [
      ...Array(3).fill(null).map(() => makeCommit('Alice')),
      makeCommit('Bob')
    ];
    handleTopAuthorsCommand(commits, { n: 2, json: true });
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({ author: 'Alice', count: 3, percent: 75 });
    expect(parsed[1]).toMatchObject({ author: 'Bob', count: 1, percent: 25 });
  });

  it('handles single author with 100 percent', () => {
    const commits = Array(5).fill(null).map(() => makeCommit('Solo'));
    handleTopAuthorsCommand(commits, { n: 5 });
    const output = getOutput();
    expect(output).toContain('100%');
  });
});
