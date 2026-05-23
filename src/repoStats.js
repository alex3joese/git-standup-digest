const { getCommits } = require('./gitLog');

/**
 * Count commits per repo from a list of grouped commits
 * @param {Object} grouped - { repoPath: [commits] }
 * @returns {Object} - { repoPath: { count, authors: Set } }
 */
function computeRepoStats(grouped) {
  const stats = {};
  for (const [repo, commits] of Object.entries(grouped)) {
    const authors = new Set(commits.map((c) => c.author));
    stats[repo] = {
      count: commits.length,
      authors: [...authors],
      firstCommit: commits[commits.length - 1]?.date ?? null,
      lastCommit: commits[0]?.date ?? null,
    };
  }
  return stats;
}

/**
 * Summarize stats across all repos
 * @param {Object} repoStats - output of computeRepoStats
 * @returns {Object}
 */
function summarizeRepoStats(repoStats) {
  const repos = Object.keys(repoStats);
  const totalCommits = repos.reduce((sum, r) => sum + repoStats[r].count, 0);
  const allAuthors = new Set(
    repos.flatMap((r) => repoStats[r].authors)
  );
  return {
    totalRepos: repos.length,
    totalCommits,
    uniqueAuthors: [...allAuthors],
  };
}

/**
 * Format a repo stats block as a string
 * @param {string} repo
 * @param {{ count: number, authors: string[], firstCommit: string, lastCommit: string }} stat
 * @returns {string}
 */
function formatRepoStat(repo, stat) {
  const lines = [
    `Repo: ${repo}`,
    `  Commits : ${stat.count}`,
    `  Authors : ${stat.authors.join(', ')}`,
  ];
  if (stat.lastCommit) lines.push(`  Latest  : ${stat.lastCommit}`);
  return lines.join('\n');
}

module.exports = { computeRepoStats, summarizeRepoStats, formatRepoStat };
