// Computes top author statistics from a list of commits

/**
 * Count commits per author.
 * @param {Array} commits
 * @returns {Object} map of author -> count
 */
function countByAuthor(commits) {
  return commits.reduce((acc, commit) => {
    const author = commit.author || 'Unknown';
    acc[author] = (acc[author] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Sort authors by commit count descending.
 * @param {Object} authorMap
 * @returns {Array<{author, count}>}
 */
function rankAuthors(authorMap) {
  return Object.entries(authorMap)
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Return top N authors.
 * @param {Array} commits
 * @param {number} n
 * @returns {Array<{author, count, percent}>}
 */
function topAuthors(commits, n = 5) {
  if (!commits || commits.length === 0) return [];
  const map = countByAuthor(commits);
  const ranked = rankAuthors(map);
  const total = commits.length;
  return ranked.slice(0, n).map(entry => ({
    author: entry.author,
    count: entry.count,
    percent: Math.round((entry.count / total) * 100)
  }));
}

/**
 * Format a single author row for display.
 * @param {{author, count, percent}} entry
 * @param {number} maxCount
 * @returns {string}
 */
function formatAuthorRow(entry, maxCount) {
  const barLen = Math.round((entry.count / maxCount) * 20);
  const bar = '█'.repeat(barLen) + '░'.repeat(20 - barLen);
  return `  ${entry.author.padEnd(24)} ${bar} ${entry.count} commits (${entry.percent}%)`;
}

/**
 * Build the full top-authors report string.
 * @param {Array} commits
 * @param {number} n
 * @returns {string}
 */
function buildTopAuthorsReport(commits, n = 5) {
  const top = topAuthors(commits, n);
  if (top.length === 0) return 'No commits found.';
  const maxCount = top[0].count;
  const lines = ['Top Authors', '-----------'];
  top.forEach(entry => lines.push(formatAuthorRow(entry, maxCount)));
  return lines.join('\n');
}

module.exports = { countByAuthor, rankAuthors, topAuthors, formatAuthorRow, buildTopAuthorsReport };
