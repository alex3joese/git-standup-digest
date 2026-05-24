const { printTopAuthorsHeader, handleTopAuthorsCommand } = require('./topAuthorsCommand');

const makeCommit = (author) => ({ author, message: 'feat: stuff', hash: 'abc123' });

let logSpy;
beforeEach(() => { logSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterEach(() => { logSpy.mockRestore(); });

describe('printTopAuthorsHeader', () => {
  it('prints header with n and since label', () => {
    printTopAuthorsHeader(5, '2024-01-01');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Top 5 Authors'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('2024-01-01'));
  });

  it('uses fallback label when since is null', () => {
    printTopAuthorsHeader(3, null);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('all loaded commits'));
  });
});

describe('handleTopAuthorsCommand', () => {
  const commits = [
    ...Array(4).fill(null).map(() => makeCommit('Alice')),
    ...Array(2).fill(null).map(() => makeCommit('Bob'))
  ];

  it('prints report to stdout by default', () => {
    handleTopAuthorsCommand(commits, { n: 2 });
    const output = logSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Alice');
    expect(output).toContain('Top Authors');
  });

  it('outputs JSON when json flag is set', () => {
    handleTopAuthorsCommand(commits, { n: 2, json: true });
    const raw = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].author).toBe('Alice');
  });

  it('handles empty commits gracefully', () => {
    handleTopAuthorsCommand([], {});
    const output = logSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('No commits found');
  });

  it('defaults to n=5', () => {
    const many = 'ABCDEFGH'.split('').map(a => makeCommit(a));
    handleTopAuthorsCommand(many, {});
    const output = logSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Top Authors');
  });
});
