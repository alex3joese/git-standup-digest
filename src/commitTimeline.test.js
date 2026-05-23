const {
  getBucket,
  groupByTimeBucket,
  formatTimelineSection,
  buildTimeline,
} = require('./commitTimeline');

function makeCommit(hour, message, repo = 'my-repo') {
  const date = new Date(2024, 0, 15, hour, 30, 0);
  return { date, message, repo };
}

describe('getBucket', () => {
  test('morning hours map to Morning', () => {
    expect(getBucket(new Date(2024, 0, 1, 9, 0))).toBe('Morning');
    expect(getBucket(new Date(2024, 0, 1, 6, 0))).toBe('Morning');
    expect(getBucket(new Date(2024, 0, 1, 11, 59))).toBe('Morning');
  });

  test('afternoon hours map to Afternoon', () => {
    expect(getBucket(new Date(2024, 0, 1, 13, 0))).toBe('Afternoon');
    expect(getBucket(new Date(2024, 0, 1, 16, 59))).toBe('Afternoon');
  });

  test('evening hours map to Evening', () => {
    expect(getBucket(new Date(2024, 0, 1, 18, 0))).toBe('Evening');
    expect(getBucket(new Date(2024, 0, 1, 20, 59))).toBe('Evening');
  });

  test('night hours map to Night', () => {
    expect(getBucket(new Date(2024, 0, 1, 23, 0))).toBe('Night');
    expect(getBucket(new Date(2024, 0, 1, 1, 0))).toBe('Night');
  });
});

describe('groupByTimeBucket', () => {
  test('groups commits into correct buckets', () => {
    const commits = [
      makeCommit(9, 'fix: login bug'),
      makeCommit(14, 'feat: dashboard'),
      makeCommit(19, 'chore: cleanup'),
      makeCommit(10, 'docs: update readme'),
    ];
    const result = groupByTimeBucket(commits);
    expect(result['Morning']).toHaveLength(2);
    expect(result['Afternoon']).toHaveLength(1);
    expect(result['Evening']).toHaveLength(1);
    expect(result['Night']).toBeUndefined();
  });

  test('handles ISO string dates', () => {
    const commit = { date: '2024-01-15T09:30:00', message: 'fix: thing', repo: 'r' };
    const result = groupByTimeBucket([commit]);
    expect(result['Morning']).toHaveLength(1);
  });

  test('returns empty object for no commits', () => {
    expect(groupByTimeBucket([])).toEqual({});
  });
});

describe('formatTimelineSection', () => {
  test('includes bucket label and commit message', () => {
    const commits = [makeCommit(10, 'fix: auth')];
    const output = formatTimelineSection('Morning', commits);
    expect(output).toContain('[Morning]');
    expect(output).toContain('fix: auth');
    expect(output).toContain('(my-repo)');
  });
});

describe('buildTimeline', () => {
  test('builds ordered timeline string', () => {
    const commits = [
      makeCommit(19, 'chore: lint'),
      makeCommit(9, 'feat: init'),
    ];
    const output = buildTimeline(commits);
    const morningIdx = output.indexOf('[Morning]');
    const eveningIdx = output.indexOf('[Evening]');
    expect(morningIdx).toBeLessThan(eveningIdx);
  });

  test('returns empty string for no commits', () => {
    expect(buildTimeline([])).toBe('');
  });
});
