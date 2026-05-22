const { startOfToday, daysAgo, formatGitDate, buildDateRange } = require('./dateRange');

describe('formatGitDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    const d = new Date(2024, 0, 5); // Jan 5 2024
    expect(formatGitDate(d)).toBe('2024-01-05');
  });

  it('pads month and day with leading zeros', () => {
    const d = new Date(2023, 8, 3); // Sep 3 2023
    expect(formatGitDate(d)).toBe('2023-09-03');
  });
});

describe('startOfToday', () => {
  it('returns a Date with time set to midnight', () => {
    const result = startOfToday();
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('returns today\'s date', () => {
    const result = startOfToday();
    const now = new Date();
    expect(result.getFullYear()).toBe(now.getFullYear());
    expect(result.getMonth()).toBe(now.getMonth());
    expect(result.getDate()).toBe(now.getDate());
  });
});

describe('daysAgo', () => {
  it('returns a date N days before the base', () => {
    const base = new Date(2024, 3, 10); // Apr 10
    const result = daysAgo(3, base);
    expect(result.getDate()).toBe(7);
    expect(result.getMonth()).toBe(3);
  });

  it('sets time to midnight', () => {
    const result = daysAgo(1);
    expect(result.getHours()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('defaults base to now', () => {
    const result = daysAgo(0);
    const today = new Date();
    expect(result.getDate()).toBe(today.getDate());
  });
});

describe('buildDateRange', () => {
  it('returns since and until strings', () => {
    const range = buildDateRange(1);
    expect(typeof range.since).toBe('string');
    expect(typeof range.until).toBe('string');
    expect(range.since).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.until).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('since equals until for days=1 (today only)', () => {
    const range = buildDateRange(1);
    expect(range.since).toBe(range.until);
  });

  it('since is before until for days > 1', () => {
    const range = buildDateRange(3);
    expect(range.since <= range.until).toBe(true);
  });

  it('throws for non-positive days', () => {
    expect(() => buildDateRange(0)).toThrow(RangeError);
    expect(() => buildDateRange(-1)).toThrow(RangeError);
  });

  it('throws for non-integer days', () => {
    expect(() => buildDateRange(1.5)).toThrow(RangeError);
  });
});
