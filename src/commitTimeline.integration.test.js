/**
 * Integration test: commitTimeline with realistic commit data
 * spanning multiple repos and time periods.
 */
const { buildTimeline, groupByTimeBucket } = require('./commitTimeline');

function makeCommit(isoTime, message, repo) {
  return { date: new Date(isoTime), message, repo };
}

const SAMPLE_COMMITS = [
  makeCommit('2024-03-12T08:15:00', 'feat: add login page', 'frontend'),
  makeCommit('2024-03-12T09:45:00', 'fix: correct token expiry', 'auth-service'),
  makeCommit('2024-03-12T13:20:00', 'refactor: extract helpers', 'frontend'),
  makeCommit('2024-03-12T15:55:00', 'test: add unit tests for auth', 'auth-service'),
  makeCommit('2024-03-12T18:10:00', 'chore: update deps', 'frontend'),
  makeCommit('2024-03-12T22:30:00', 'docs: update API docs', 'backend'),
];

describe('commitTimeline integration', () => {
  test('all commits are accounted for across buckets', () => {
    const buckets = groupByTimeBucket(SAMPLE_COMMITS);
    const total = Object.values(buckets).reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBe(SAMPLE_COMMITS.length);
  });

  test('morning bucket contains early commits', () => {
    const buckets = groupByTimeBucket(SAMPLE_COMMITS);
    const messages = buckets['Morning'].map(c => c.message);
    expect(messages).toContain('feat: add login page');
    expect(messages).toContain('fix: correct token expiry');
  });

  test('buildTimeline output contains all bucket headers present in data', () => {
    const output = buildTimeline(SAMPLE_COMMITS);
    expect(output).toContain('[Morning]');
    expect(output).toContain('[Afternoon]');
    expect(output).toContain('[Evening]');
    expect(output).toContain('[Night]');
  });

  test('buildTimeline output lists repo names', () => {
    const output = buildTimeline(SAMPLE_COMMITS);
    expect(output).toContain('(frontend)');
    expect(output).toContain('(auth-service)');
    expect(output).toContain('(backend)');
  });

  test('sections appear in chronological order', () => {
    const output = buildTimeline(SAMPLE_COMMITS);
    const positions = ['Morning', 'Afternoon', 'Evening', 'Night'].map(l => output.indexOf(`[${l}]`));
    const filtered = positions.filter(p => p !== -1);
    for (let i = 1; i < filtered.length; i++) {
      expect(filtered[i]).toBeGreaterThan(filtered[i - 1]);
    }
  });
});
