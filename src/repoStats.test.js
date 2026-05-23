const { computeRepoStats, summarizeRepoStats, formatRepoStat } = require('./repoStats');

const grouped = {
  '/projects/alpha': [
    { hash: 'aaa', message: 'feat: init', author: 'alice', date: '2024-06-10' },
    { hash: 'bbb', message: 'fix: bug', author: 'bob', date: '2024-06-09' },
  ],
  '/projects/beta': [
    { hash: 'ccc', message: 'chore: setup', author: 'alice', date: '2024-06-10' },
  ],
};

describe('computeRepoStats', () => {
  it('counts commits per repo', () => {
    const stats = computeRepoStats(grouped);
    expect(stats['/projects/alpha'].count).toBe(2);
    expect(stats['/projects/beta'].count).toBe(1);
  });

  it('collects unique authors per repo', () => {
    const stats = computeRepoStats(grouped);
    expect(stats['/projects/alpha'].authors).toContain('alice');
    expect(stats['/projects/alpha'].authors).toContain('bob');
    expect(stats['/projects/beta'].authors).toEqual(['alice']);
  });

  it('records first and last commit dates', () => {
    const stats = computeRepoStats(grouped);
    expect(stats['/projects/alpha'].lastCommit).toBe('2024-06-10');
    expect(stats['/projects/alpha'].firstCommit).toBe('2024-06-09');
  });

  it('handles empty grouped object', () => {
    expect(computeRepoStats({})).toEqual({});
  });
});

describe('summarizeRepoStats', () => {
  it('totals repos and commits', () => {
    const stats = computeRepoStats(grouped);
    const summary = summarizeRepoStats(stats);
    expect(summary.totalRepos).toBe(2);
    expect(summary.totalCommits).toBe(3);
  });

  it('collects unique authors across all repos', () => {
    const stats = computeRepoStats(grouped);
    const summary = summarizeRepoStats(stats);
    expect(summary.uniqueAuthors).toContain('alice');
    expect(summary.uniqueAuthors).toContain('bob');
    expect(summary.uniqueAuthors.length).toBe(2);
  });
});

describe('formatRepoStat', () => {
  it('formats a stat block as a string', () => {
    const stats = computeRepoStats(grouped);
    const output = formatRepoStat('/projects/alpha', stats['/projects/alpha']);
    expect(output).toContain('Repo: /projects/alpha');
    expect(output).toContain('Commits : 2');
    expect(output).toContain('alice');
    expect(output).toContain('Latest  : 2024-06-10');
  });
});
