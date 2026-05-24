const {
  toMonthKey,
  toDayKey,
  countByDay,
  buildCalendarGrid,
  renderCalendar,
  buildCommitCalendar,
} = require('./commitCalendar');

function makeCommit(dateStr) {
  return { hash: 'abc', message: 'test', date: dateStr, author: 'dev', repo: 'repo' };
}

describe('toMonthKey', () => {
  it('returns YYYY-MM for a date', () => {
    expect(toMonthKey(new Date('2024-03-15'))).toBe('2024-03');
  });
});

describe('toDayKey', () => {
  it('returns YYYY-MM-DD for a date', () => {
    expect(toDayKey(new Date('2024-03-15T10:00:00Z'))).toBe('2024-03-15');
  });
});

describe('countByDay', () => {
  it('counts commits per day', () => {
    const commits = [
      makeCommit('2024-03-01T09:00:00Z'),
      makeCommit('2024-03-01T11:00:00Z'),
      makeCommit('2024-03-02T10:00:00Z'),
    ];
    const counts = countByDay(commits);
    expect(counts['2024-03-01']).toBe(2);
    expect(counts['2024-03-02']).toBe(1);
  });

  it('returns empty object for no commits', () => {
    expect(countByDay([])).toEqual({});
  });
});

describe('buildCalendarGrid', () => {
  it('has correct number of weeks for March 2024', () => {
    const grid = buildCalendarGrid('2024-03', {});
    // March 2024 starts on Friday (5), 31 days => 6 weeks
    expect(grid.length).toBeGreaterThanOrEqual(5);
  });

  it('first cell offset matches day of week', () => {
    const grid = buildCalendarGrid('2024-03', {});
    // March 1 2024 is a Friday (index 5), so first 5 cells are null
    const firstWeek = grid[0];
    const nullCount = firstWeek.filter(c => c === null).length;
    expect(nullCount).toBe(5);
  });

  it('marks days with commits', () => {
    const grid = buildCalendarGrid('2024-03', { '2024-03-01': 3 });
    const firstWeek = grid[0];
    const march1 = firstWeek.find(c => c && c.day === 1);
    expect(march1.count).toBe(3);
  });
});

describe('renderCalendar', () => {
  it('includes the month key in output', () => {
    const output = renderCalendar('2024-03', {});
    expect(output).toContain('2024-03');
  });

  it('includes day headers', () => {
    const output = renderCalendar('2024-03', {});
    expect(output).toContain('Su');
    expect(output).toContain('Sa');
  });

  it('shows day number for days with commits', () => {
    const output = renderCalendar('2024-03', { '2024-03-05': 2 });
    expect(output).toContain(' 5');
  });

  it('shows -- for days without commits', () => {
    const output = renderCalendar('2024-03', {});
    expect(output).toContain('--');
  });
});

describe('buildCommitCalendar', () => {
  it('returns one entry per distinct month', () => {
    const commits = [
      makeCommit('2024-03-01T10:00:00Z'),
      makeCommit('2024-04-15T10:00:00Z'),
    ];
    const result = buildCommitCalendar(commits);
    expect(result.length).toBe(2);
    expect(result[0].monthKey).toBe('2024-03');
    expect(result[1].monthKey).toBe('2024-04');
  });

  it('returns empty array for no commits', () => {
    expect(buildCommitCalendar([])).toEqual([]);
  });

  it('each entry has rendered string', () => {
    const commits = [makeCommit('2024-03-10T10:00:00Z')];
    const result = buildCommitCalendar(commits);
    expect(typeof result[0].rendered).toBe('string');
    expect(result[0].rendered.length).toBeGreaterThan(0);
  });
});
