// repoHealth.js — checks basic health indicators for a repo's commits

/**
 * Returns true if any commit message looks like a merge commit
 */
function isMergeCommit(commit) {
  return /^Merge (branch|pull request|remote)/i.test(commit.message);
}

/**
 * Counts how many commits are merge commits
 */
function countMergeCommits(commits) {
  return commits.filter(isMergeCommit).length;
}

/**
 * Returns true if commit message is suspiciously short (likely low quality)
 */
function isVagueCommit(commit) {
  const msg = commit.message.trim();
  return msg.length < 8 || /^(wip|fix|update|misc|temp|test|asdf|stuff)$/i.test(msg);
}

/**
 * Counts vague/low-quality commit messages
 */
function countVagueCommits(commits) {
  return commits.filter(isVagueCommit).length;
}

/**
 * Computes a simple health score (0–100) for a set of commits
 */
function computeHealthScore(commits) {
  if (!commits || commits.length === 0) return null;

  const total = commits.length;
  const mergeRatio = countMergeCommits(commits) / total;
  const vagueRatio = countVagueCommits(commits) / total;

  const score = Math.round(100 - mergeRatio * 40 - vagueRatio * 60);
  return Math.max(0, Math.min(100, score));
}

/**
 * Builds a health report object for a list of commits
 */
function buildHealthReport(commits) {
  const total = commits.length;
  const mergeCount = countMergeCommits(commits);
  const vagueCount = countVagueCommits(commits);
  const score = computeHealthScore(commits);

  return {
    total,
    mergeCount,
    vagueCount,
    score,
    rating: score === null ? 'n/a' : score >= 80 ? 'good' : score >= 50 ? 'fair' : 'poor',
  };
}

module.exports = {
  isMergeCommit,
  countMergeCommits,
  isVagueCommit,
  countVagueCommits,
  computeHealthScore,
  buildHealthReport,
};
