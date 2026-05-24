const { commitsByDay, averagePerDay, busiestDay, buildVelocitySummary } = require('./commitVelocity');

function makeCommit(date, message = 'chore: test') {
  return { hash: Math.random().toString(36).slice(2), date, message, author: 'dev', repo: 'repo' };
}

describe('commitsByDay', () => {
  it('counts commits per day', () => {
    const commits = [
      makeCommit('2024-05-01T10:00:00'),
      makeCommit('2024-05-01T14:00:00'),
      makeCommit('2024-05-02T09:00:00'),
    ];
    const result = commitsByDay(commits);
    expect(result['2024-05-01']).toBe(2);
    expect(result['2024-05-02']).toBe(1);
  });

  it('returns empty object for no commits', () => {
    expect(commitsByDay([])).toEqual({});
  });

  it('skips commits with no date', () => {
    const commits = [{ hash: 'abc', message: 'fix', author: 'dev', repo: 'r' }];
    expect(commitsByDay(commits)).toEqual({});
  });
});

describe('averagePerDay', () => {
  it('calculates average correctly', () => {
    expect(averagePerDay({ '2024-05-01': 4, '2024-05-02': 2 })).toBe(3);
  });

  it('returns 0 for empty map', () => {
    expect(averagePerDay({})).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(averagePerDay({ a: 1, b: 1, c: 2 })).toBe(1.33);
  });
});

describe('busiestDay', () => {
  it('returns the day with most commits', () => {
    const result = busiestDay({ '2024-05-01': 2, '2024-05-03': 7, '2024-05-02': 3 });
    expect(result).toEqual({ date: '2024-05-03', count: 7 });
  });

  it('returns null for empty map', () => {
    expect(busiestDay({})).toBeNull();
  });
});

describe('buildVelocitySummary', () => {
  it('returns full summary object', () => {
    const commits = [
      makeCommit('2024-05-01T08:00:00'),
      makeCommit('2024-05-01T10:00:00'),
      makeCommit('2024-05-02T09:00:00'),
    ];
    const summary = buildVelocitySummary(commits);
    expect(summary.totalCommits).toBe(3);
    expect(summary.totalDays).toBe(2);
    expect(summary.averagePerDay).toBe(1.5);
    expect(summary.busiestDay).toEqual({ date: '2024-05-01', count: 2 });
  });

  it('handles empty commits', () => {
    const summary = buildVelocitySummary([]);
    expect(summary.totalCommits).toBe(0);
    expect(summary.totalDays).toBe(0);
    expect(summary.busiestDay).toBeNull();
  });
});
