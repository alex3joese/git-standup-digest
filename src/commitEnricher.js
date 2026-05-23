import { annotateCommitsWithDiffStat } from './diffStat.js';
import { filterByAuthor } from './authorFilter.js';

/**
 * Enriches raw commits with diff stats and applies author filtering.
 * Returns a flat list of commits ready for formatting.
 */
export async function enrichCommits(commits, options = {}) {
  const { author, includeDiffStat = false } = options;

  let filtered = author ? filterByAuthor(commits, author) : commits;

  if (includeDiffStat && filtered.length > 0) {
    filtered = await annotateCommitsWithDiffStat(filtered);
  }

  return filtered;
}

/**
 * Summarizes enriched commits into a stats object.
 */
export function summarizeCommits(commits) {
  const repos = new Set(commits.map((c) => c.repo));
  const totalInsertions = commits.reduce(
    (sum, c) => sum + (c.diffStat?.insertions ?? 0),
    0
  );
  const totalDeletions = commits.reduce(
    (sum, c) => sum + (c.diffStat?.deletions ?? 0),
    0
  );
  const totalFilesChanged = commits.reduce(
    (sum, c) => sum + (c.diffStat?.filesChanged ?? 0),
    0
  );

  return {
    totalCommits: commits.length,
    totalRepos: repos.size,
    totalInsertions,
    totalDeletions,
    totalFilesChanged,
  };
}

/**
 * Formats a summary stats object into a human-readable string.
 */
export function formatSummaryLine(stats) {
  const parts = [`${stats.totalCommits} commit(s) across ${stats.totalRepos} repo(s)`];
  if (stats.totalFilesChanged > 0) {
    parts.push(
      `${stats.totalFilesChanged} file(s) changed, +${stats.totalInsertions}/-${stats.totalDeletions}`
    );
  }
  return parts.join(' — ');
}
