/**
 * Utilities for filtering commits by author.
 */

/**
 * Normalize an author string for comparison (lowercase, trimmed).
 * @param {string} author
 * @returns {string}
 */
function normalizeAuthor(author) {
  return (author || '').trim().toLowerCase();
}

/**
 * Check if a commit matches the given author filter.
 * Matches against both name and email fields if present.
 * @param {Object} commit - commit object with `author` field
 * @param {string} filterAuthor - author name or email to match
 * @returns {boolean}
 */
function commitMatchesAuthor(commit, filterAuthor) {
  if (!filterAuthor) return true;
  const normalized = normalizeAuthor(filterAuthor);
  const authorField = normalizeAuthor(commit.author || '');
  const emailField = normalizeAuthor(commit.email || '');
  return authorField.includes(normalized) || emailField.includes(normalized);
}

/**
 * Filter an array of commits by author.
 * @param {Object[]} commits
 * @param {string|null} author - if null/undefined, returns all commits
 * @returns {Object[]}
 */
function filterByAuthor(commits, author) {
  if (!author) return commits;
  return commits.filter((commit) => commitMatchesAuthor(commit, author));
}

/**
 * Resolve the effective author filter: explicit arg takes precedence,
 * then config default, then null (no filter).
 * @param {string|null} argAuthor - from CLI args
 * @param {Object} config - loaded config object
 * @returns {string|null}
 */
function resolveAuthorFilter(argAuthor, config) {
  if (argAuthor) return argAuthor;
  if (config && config.defaultAuthor) return config.defaultAuthor;
  return null;
}

module.exports = {
  normalizeAuthor,
  commitMatchesAuthor,
  filterByAuthor,
  resolveAuthorFilter,
};
