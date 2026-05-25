const {
  getHourBucket,
  countByBucket,
  peakBucket,
  buildPaceSummary,
  formatPaceReport,
} = require('./commitPaceAnalyzer');

function makeCommit(hour) {
  const d = new Date('2024-01-15');
  d.setHours(hour, 0, 0, 0);
  return { hash: 'abc', message: 'test', date: d.toISOString(), repo: 'repo' };
}

describe('getHourBucket', () => {
  it('returns morning for hour 9', () => expect(getHourBucket(makeCommit(9).date)).toBe('morning'));
  it('returns afternoon for hour 14', () => expect(getHourBucket(makeCommit(14).date)).toBe('afternoon'));
  it('returns evening for hour 20', () => expect(getHourBucket(makeCommit(20).date)).toBe('evening'));
  it('returns night for hour 2', () => expect(getHourBucket(makeCommit(2).date)).toBe('night'));
  it('returns night for hour 23', () => expect(getHourBucket(makeCommit(23).date)).toBe('night'));
});

describe('countByBucket', () => {
  it('counts commits into correct buckets', () => {
    const commits = [makeCommit(8), makeCommit(9), makeCommit(14), makeCommit(21)];
    const counts = countByBucket(commits);
    expect(counts.morning).toBe(2);
    expect(counts.afternoon).toBe(1);
    expect(counts.evening).toBe(1);
    expect(counts.night).toBe(0);
  });

  it('returns all zeros for empty array', () => {
    const counts = countByBucket([]);
    expect(counts).toEqual({ morning: 0, afternoon: 0, evening: 0, night: 0 });
  });
});

describe('peakBucket', () => {
  it('returns the bucket with the most commits', () => {
    const counts = { morning: 5, afternoon: 3, evening: 1, night: 0 };
    expect(peakBucket(counts)).toBe('morning');
  });
});

describe('buildPaceSummary', () => {
  it('returns correct summary for commits', () => {
    const commits = [makeCommit(7), makeCommit(8), makeCommit(15)];
    const summary = buildPaceSummary(commits);
    expect(summary.peak).toBe('morning');
    expect(summary.total).toBe(3);
    expect(summary.counts.morning).toBe(2);
  });

  it('handles empty commits', () => {
    const summary = buildPaceSummary([]);
    expect(summary.peak).toBe('none');
    expect(summary.total).toBe(0);
  });
});

describe('formatPaceReport', () => {
  it('includes header and peak line', () => {
    const summary = buildPaceSummary([makeCommit(9), makeCommit(10)]);
    const report = formatPaceReport(summary);
    expect(report).toContain('Commit Pace Analysis');
    expect(report).toContain('Peak time: morning');
  });
});
