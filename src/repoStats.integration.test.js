const path = require('path');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');
const { groupByRepo } = require('./formatDigest');
const { computeRepoStats, summarizeRepoStats } = require('./repoStats');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'repo-stats-test-'));
}

function initRepoWithCommit(dir, message, author) {
  execSync('git init', { cwd: dir });
  execSync('git config user.email "test@test.com"', { cwd: dir });
  execSync(`git config user.name "${author}"`, { cwd: dir });
  fs.writeFileSync(path.join(dir, 'file.txt'), message);
  execSync('git add .', { cwd: dir });
  execSync(`git commit -m "${message}"`, { cwd: dir });
}

describe('repoStats integration', () => {
  let dirs = [];

  afterAll(() => {
    dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
  });

  it('computes stats from real grouped commits', () => {
    const dir1 = makeTmpDir();
    const dir2 = makeTmpDir();
    dirs.push(dir1, dir2);

    initRepoWithCommit(dir1, 'initial commit', 'alice');
    initRepoWithCommit(dir2, 'setup project', 'bob');

    const fakeCommits = [
      { hash: 'a1', message: 'initial commit', author: 'alice', date: '2024-06-10', repo: dir1 },
      { hash: 'b1', message: 'setup project', author: 'bob', date: '2024-06-10', repo: dir2 },
      { hash: 'b2', message: 'fix typo', author: 'bob', date: '2024-06-09', repo: dir2 },
    ];

    const grouped = groupByRepo(fakeCommits);
    const stats = computeRepoStats(grouped);
    const summary = summarizeRepoStats(stats);

    expect(summary.totalRepos).toBe(2);
    expect(summary.totalCommits).toBe(3);
    expect(summary.uniqueAuthors).toContain('alice');
    expect(summary.uniqueAuthors).toContain('bob');
    expect(stats[dir2].count).toBe(2);
  });
});
