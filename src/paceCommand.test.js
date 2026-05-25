const { handlePaceCommand, printPaceHeader } = require('./paceCommand');

function makeCommit(hour) {
  const d = new Date('2024-03-01');
  d.setHours(hour, 0, 0, 0);
  return { hash: `h${hour}`, message: 'fix: something', date: d.toISOString(), repo: 'myrepo' };
}

describe('handlePaceCommand', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('returns null and logs message when no commits', () => {
    const result = handlePaceCommand([]);
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('No commits found for pace analysis.');
  });

  it('returns summary when commits provided', () => {
    const commits = [makeCommit(9), makeCommit(10), makeCommit(15)];
    const result = handlePaceCommand(commits, { silent: true });
    expect(result).not.toBeNull();
    expect(result.total).toBe(3);
    expect(result.peak).toBe('morning');
  });

  it('prints report when not silent', () => {
    const commits = [makeCommit(8), makeCommit(20)];
    handlePaceCommand(commits, { date: '2024-03-01' });
    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('Commit Pace');
    expect(output).toContain('Peak time');
  });

  it('handles null commits gracefully', () => {
    const result = handlePaceCommand(null);
    expect(result).toBeNull();
  });
});

describe('printPaceHeader', () => {
  it('prints header with provided date', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printPaceHeader('Mon Jan 15 2024');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Mon Jan 15 2024'));
    spy.mockRestore();
  });
});
