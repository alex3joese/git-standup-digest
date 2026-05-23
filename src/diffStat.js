const { execSync } = require('child_process');

/**
 * Get a diff stat summary for a commit in a given repo.
 * Returns lines added/removed counts.
 */
function getCommitDiffStat(repoPath, commitHash) {
  try {
    const output = execSync(
      `git -C "${repoPath}" diff --shortstat ${commitHash}^..${commitHash}`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    return parseDiffStatLine(output);
  } catch {
    // Root commit or error — no parent to diff against
    return { added: 0, removed: 0 };
  }
}

/**
 * Parse a git --shortstat line like:
 * " 3 files changed, 42 insertions(+), 7 deletions(-)"
 */
function parseDiffStatLine(line) {
  if (!line) return { added: 0, removed: 0 };

  const addedMatch = line.match(/(\d+) insertion/);
  const removedMatch = line.match(/(\d+) deletion/);

  return {
    added: addedMatch ? parseInt(addedMatch[1], 10) : 0,
    removed: removedMatch ? parseInt(removedMatch[1], 10) : 0,
  };
}

/**
 * Format a diff stat as a short string, e.g. "+42 -7"
 * Returns empty string if both are zero.
 */
function formatDiffStat({ added, removed }) {
  if (added === 0 && removed === 0) return '';
  const parts = [];
  if (added > 0) parts.push(`+${added}`);
  if (removed > 0) parts.push(`-${removed}`);
  return parts.join(' ');
}

/**
 * Annotate an array of commit objects with diff stat info.
 * Each commit should have { hash, repoPath, ... }.
 */
function annotateCommitsWithDiffStat(commits) {
  return commits.map((commit) => {
    const stat = getCommitDiffStat(commit.repoPath, commit.hash);
    return { ...commit, diffStat: stat, diffStatLabel: formatDiffStat(stat) };
  });
}

module.exports = {
  getCommitDiffStat,
  parseDiffStatLine,
  formatDiffStat,
  annotateCommitsWithDiffStat,
};
