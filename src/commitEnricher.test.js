import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrichCommits, summarizeCommits, formatSummaryLine } from './commitEnricher.js';

vi.mock('./diffStat.js', () => ({
  annotateCommitsWithDiffStat: vi.fn(async (commits) =>
    commits.map((c) => ({ ...c, diffStat: { filesChanged: 2, insertions: 5, deletions: 1 } }))
  ),
}));

vi.mock('./authorFilter.js', () => ({
  filterByAuthor: vi.fn((commits, author) =>
    commits.filter((c) => c.author === author)
  ),
}));

const sampleCommits = [
  { hash: 'abc', repo: '/proj/a', message: 'fix bug', author: 'alice' },
  { hash: 'def', repo: '/proj/b', message: 'add feature', author: 'bob' },
  { hash: 'ghi', repo: '/proj/a', message: 'refactor', author: 'alice' },
];

describe('enrichCommits', () => {
  it('returns all commits when no author filter', async () => {
    const result = await enrichCommits(sampleCommits);
    expect(result).toHaveLength(3);
  });

  it('filters by author when provided', async () => {
    const result = await enrichCommits(sampleCommits, { author: 'alice' });
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.author === 'alice')).toBe(true);
  });

  it('annotates with diffStat when includeDiffStat is true', async () => {
    const result = await enrichCommits(sampleCommits, { includeDiffStat: true });
    expect(result[0].diffStat).toBeDefined();
    expect(result[0].diffStat.insertions).toBe(5);
  });

  it('skips diffStat annotation when includeDiffStat is false', async () => {
    const { annotateCommitsWithDiffStat } = await import('./diffStat.js');
    annotateCommitsWithDiffStat.mockClear();
    await enrichCommits(sampleCommits, { includeDiffStat: false });
    expect(annotateCommitsWithDiffStat).not.toHaveBeenCalled();
  });

  it('returns empty array for empty input', async () => {
    const result = await enrichCommits([]);
    expect(result).toEqual([]);
  });
});

describe('summarizeCommits', () => {
  const enriched = sampleCommits.map((c) => ({
    ...c,
    diffStat: { filesChanged: 3, insertions: 10, deletions: 2 },
  }));

  it('counts commits and unique repos', () => {
    const stats = summarizeCommits(enriched);
    expect(stats.totalCommits).toBe(3);
    expect(stats.totalRepos).toBe(2);
  });

  it('sums diff stat totals', () => {
    const stats = summarizeCommits(enriched);
    expect(stats.totalInsertions).toBe(30);
    expect(stats.totalDeletions).toBe(6);
    expect(stats.totalFilesChanged).toBe(9);
  });

  it('handles commits without diffStat', () => {
    const stats = summarizeCommits(sampleCommits);
    expect(stats.totalInsertions).toBe(0);
    expect(stats.totalFilesChanged).toBe(0);
  });
});

describe('formatSummaryLine', () => {
  it('formats basic summary without diff stats', () => {
    const line = formatSummaryLine({ totalCommits: 4, totalRepos: 2, totalFilesChanged: 0, totalInsertions: 0, totalDeletions: 0 });
    expect(line).toBe('4 commit(s) across 2 repo(s)');
  });

  it('includes file change info when available', () => {
    const line = formatSummaryLine({ totalCommits: 2, totalRepos: 1, totalFilesChanged: 5, totalInsertions: 12, totalDeletions: 3 });
    expect(line).toContain('+12/-3');
    expect(line).toContain('5 file(s) changed');
  });
});
