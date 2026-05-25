'use strict';

const { topRepos, signOff, buildRecap, formatRecap } = require('./commitRecap');

const makeCommit = (repo, message, date = '2024-05-01T10:00:00Z', author = 'Alice') => ({
  repo,
  message,
  date,
  author,
  hash: Math.random().toString(36).slice(2),
});

describe('signOff', () => {
  it('returns rest message for 0 commits', () => {
    expect(signOff(0)).toMatch(/No commits/);
  });

  it('returns slow day for 1-2 commits', () => {
    expect(signOff(1)).toMatch(/Slow day/);
    expect(signOff(2)).toMatch(/Slow day/);
  });

  it('returns solid work for 3-7', () => {
    expect(signOff(5)).toMatch(/Solid/);
  });

  it('returns crushing it for 8-14', () => {
    expect(signOff(10)).toMatch(/Crushing/);
  });

  it('returns legendary for 15+', () => {
    expect(signOff(20)).toMatch(/Legendary/);
  });
});

describe('topRepos', () => {
  it('returns top repos sorted by commit count', () => {
    const grouped = {
      'repo-a': [makeCommit('repo-a', 'fix'), makeCommit('repo-a', 'feat')],
      'repo-b': [makeCommit('repo-b', 'chore')],
      'repo-c': [makeCommit('repo-c', 'docs'), makeCommit('repo-c', 'test'), makeCommit('repo-c', 'fix')],
    };
    const result = topRepos(grouped, 2);
    expect(result[0].repo).toBe('repo-c');
    expect(result[0].count).toBe(3);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty grouped', () => {
    expect(topRepos({}, 3)).toEqual([]);
  });
});

describe('buildRecap', () => {
  const commits = [
    makeCommit('repo-a', 'feat: add login'),
    makeCommit('repo-a', 'fix: typo'),
    makeCommit('repo-b', 'chore: update deps'),
  ];

  it('returns correct total and repo count', () => {
    const recap = buildRecap(commits, 'Alice');
    expect(recap.totalCommits).toBe(3);
    expect(recap.repoCount).toBe(2);
    expect(recap.author).toBe('Alice');
  });

  it('includes topRepos', () => {
    const recap = buildRecap(commits, 'Alice');
    expect(recap.topRepos[0].repo).toBe('repo-a');
  });

  it('includes a signOff', () => {
    const recap = buildRecap(commits, 'Alice');
    expect(typeof recap.signOff).toBe('string');
  });
});

describe('formatRecap', () => {
  it('includes author name and commit count', () => {
    const recap = buildRecap([makeCommit('repo-a', 'feat: thing')], 'Bob');
    const output = formatRecap(recap);
    expect(output).toContain('Bob');
    expect(output).toContain('1 commit');
  });

  it('includes top repos section', () => {
    const commits = [makeCommit('repo-x', 'fix: bug'), makeCommit('repo-x', 'feat: new')];
    const recap = buildRecap(commits, 'Dev');
    const output = formatRecap(recap);
    expect(output).toContain('repo-x');
  });
});
