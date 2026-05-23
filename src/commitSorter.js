/**
 * commitSorter.js
 * Sorts commits by various criteria: date, repo, message, author
 */

/**
 * Sort commits by date ascending or descending
 * @param {Array} commits
 * @param {'asc'|'desc'} direction
 * @returns {Array}
 */
function sortByDate(commits, direction = 'desc') {
  return [...commits].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Sort commits alphabetically by repo name
 * @param {Array} commits
 * @returns {Array}
 */
function sortByRepo(commits) {
  return [...commits].sort((a, b) =>
    (a.repo || '').localeCompare(b.repo || '')
  );
}

/**
 * Sort commits alphabetically by commit message
 * @param {Array} commits
 * @returns {Array}
 */
function sortByMessage(commits) {
  return [...commits].sort((a, b) =>
    (a.message || '').localeCompare(b.message || '')
  );
}

/**
 * Sort commits alphabetically by author name
 * @param {Array} commits
 * @returns {Array}
 */
function sortByAuthor(commits) {
  return [...commits].sort((a, b) =>
    (a.author || '').localeCompare(b.author || '')
  );
}

/**
 * Sort commits by a given field
 * @param {Array} commits
 * @param {'date'|'repo'|'message'|'author'} field
 * @param {'asc'|'desc'} direction - only used for date
 * @returns {Array}
 */
function sortCommits(commits, field = 'date', direction = 'desc') {
  switch (field) {
    case 'repo':    return sortByRepo(commits);
    case 'message': return sortByMessage(commits);
    case 'author':  return sortByAuthor(commits);
    case 'date':
    default:        return sortByDate(commits, direction);
  }
}

module.exports = { sortByDate, sortByRepo, sortByMessage, sortByAuthor, sortCommits };
