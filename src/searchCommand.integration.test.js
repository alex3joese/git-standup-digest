// Integration test: searchCommits + formatSearchResult round-trip
const { searchCommits } = require('./commitSearch');
const { formatSearchResult } = require('./searchCommand');

const sampleCommits = [
  { hash: '001', message: 'feat: user authentication', author: 'Alice', repo: 'auth-service', date: '2024-06-10T08:00:00Z' },
  { hash: '002', message: 'fix: token expiry edge case', author: 'Alice', repo: 'auth-service', date: '2024-06-10T09:30:00Z' },
  { hash: '003', message: 'feat: payment integration', author: 'Bob', repo: 'billing', date: '2024-06-10T10:00:00Z' },
  { hash: '004', message: 'docs: update API reference', author: 'Carol', repo: 'docs', date: '2024-06-09T15:00:00Z' },
  { hash: '005', message: 'chore: bump lodash version', author: 'Bob', repo: 'billing', date: '2024-06-08T11:00:00Z' },
];

describe('search integration', () => {
  test('search by keyword and render results', () => {
    const results = searchCommits(sampleCommits, { keyword: 'feat' });
    expect(results).toHaveLength(2);
    const lines = results.map(c => formatSearchResult(c, 'feat'));
    expect(lines[0]).toContain('[auth-service]');
    expect(lines[1]).toContain('[billing]');
    lines.forEach(l => expect(l).toContain('\x1b[33m'));
  });

  test('search by author and repo', () => {
    const results = searchCommits(sampleCommits, { author: 'Bob', repo: 'billing' });
    expect(results).toHaveLength(2);
    results.forEach(c => expect(c.author).toBe('Bob'));
  });

  test('search by date range', () => {
    const results = searchCommits(sampleCommits, {
      since: '2024-06-10T00:00:00Z',
      until: '2024-06-10T23:59:59Z',
    });
    expect(results).toHaveLength(3);
  });

  test('no results returns empty array', () => {
    const results = searchCommits(sampleCommits, { keyword: 'nonexistent-xyz' });
    expect(results).toHaveLength(0);
  });

  test('combined filters narrow results correctly', () => {
    const results = searchCommits(sampleCommits, { keyword: 'fix', author: 'Alice' });
    expect(results).toHaveLength(1);
    expect(results[0].hash).toBe('002');
    const line = formatSearchResult(results[0], 'fix');
    expect(line).toContain('token expiry edge case');
  });
});
