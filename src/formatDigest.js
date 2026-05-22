/**
 * Formats raw git commits into a readable standup digest.
 */

/**
 * Groups commits by repository name.
 * @param {Array} commits - Array of commit objects from getCommits
 * @returns {Object} - Commits grouped by repo
 */
function groupByRepo(commits) {
  return commits.reduce((acc, commit) => {
    const { repo } = commit;
    if (!acc[repo]) {
      acc[repo] = [];
    }
    acc[repo].push(commit);
    return acc;
  }, {});
}

/**
 * Formats a single commit line.
 * @param {Object} commit
 * @returns {string}
 */
function formatCommitLine(commit) {
  const time = commit.date
    ? new Date(commit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  const timePart = time ? ` (${time})` : '';
  return `  - ${commit.message}${timePart}`;
}

/**
 * Formats the full digest as a human-readable string.
 * @param {Array} commits - Array of commit objects
 * @param {Object} options
 * @param {string} [options.date] - Date label for the digest header
 * @returns {string}
 */
function formatDigest(commits, options = {}) {
  if (!commits || commits.length === 0) {
    return 'No commits found for this period.';
  }

  const dateLabel = options.date || new Date().toLocaleDateString();
  const grouped = groupByRepo(commits);
  const lines = [`📋 Standup Digest — ${dateLabel}`, ''];

  for (const [repo, repoCommits] of Object.entries(grouped)) {
    lines.push(`🗂  ${repo}`);
    for (const commit of repoCommits) {
      lines.push(formatCommitLine(commit));
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

module.exports = { formatDigest, groupByRepo, formatCommitLine };
