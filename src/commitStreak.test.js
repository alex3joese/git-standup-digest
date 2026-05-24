const {
  toDateString,
  getUniqueDays,
  computeCurrentStreak,
  computeLongestStreak,
  buildStreakSummary,
} = require('./commitStreak');

function makeCommit(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return { hash: `abc${daysBack}`, message: 'test', date: d.toISOString() };
}

describe('toDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = toDateString('2024-06-15T10:00:00Z');
    expect(result).toBe('2024-06-15');
  });
});

describe('getUniqueDays', () => {
  it('deduplicates same-day commits', () => {
    const commits = [makeCommit(0), makeCommit(0), makeCommit(1)];
    const days = getUniqueDays(commits);
    expect(days.length).toBe(2);
  });

  it('returns days sorted descending', () => {
    const commits = [makeCommit(2), makeCommit(0), makeCommit(1)];
    const days = getUniqueDays(commits);
    expect(days[0] >= days[1]).toBe(true);
    expect(days[1] >= days[2]).toBe(true);
  });

  it('returns empty array for no commits', () => {
    expect(getUniqueDays([])).toEqual([]);
  });
});

describe('computeCurrentStreak', () => {
  it('returns 0 for no commits', () => {
    expect(computeCurrentStreak([])).toBe(0);
  });

  it('returns 1 for only today', () => {
    expect(computeCurrentStreak([makeCommit(0)])).toBe(1);
  });

  it('counts consecutive days from today', () => {
    const commits = [makeCommit(0), makeCommit(1), makeCommit(2)];
    expect(computeCurrentStreak(commits)).toBe(3);
  });

  it('stops at a gap', () => {
    const commits = [makeCommit(0), makeCommit(1), makeCommit(3)];
    expect(computeCurrentStreak(commits)).toBe(2);
  });

  it('returns 0 if last commit was 2+ days ago', () => {
    const commits = [makeCommit(3), makeCommit(4)];
    expect(computeCurrentStreak(commits)).toBe(0);
  });
});

describe('computeLongestStreak', () => {
  it('returns 0 for no commits', () => {
    expect(computeLongestStreak([])).toBe(0);
  });

  it('finds longest run in history', () => {
    // gap at day 8, streak of 5 then streak of 3
    const commits = [
      makeCommit(0), makeCommit(1), makeCommit(2), makeCommit(3), makeCommit(4),
      makeCommit(10), makeCommit(11), makeCommit(12),
    ];
    expect(computeLongestStreak(commits)).toBe(5);
  });
});

describe('buildStreakSummary', () => {
  it('returns correct summary shape', () => {
    const commits = [makeCommit(0), makeCommit(1), makeCommit(2)];
    const summary = buildStreakSummary(commits);
    expect(summary).toHaveProperty('totalDays', 3);
    expect(summary).toHaveProperty('currentStreak', 3);
    expect(summary).toHaveProperty('longestStreak', 3);
  });

  it('handles empty commits', () => {
    const summary = buildStreakSummary([]);
    expect(summary.totalDays).toBe(0);
    expect(summary.currentStreak).toBe(0);
    expect(summary.longestStreak).toBe(0);
  });
});
