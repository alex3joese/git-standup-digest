/**
 * commitFilter.js
 * Utilities for filtering commits by message patterns, paths, or other criteria.
 */

/**
 * Returns true if the commit message matches any of the given keyword patterns.
 * @param {object} commit
 * @param {string[]} keywords
 * @returns {boolean}
 */
function commitMatchesKeyword(commit, keywords) {
  if (!keywords || keywords.length === 0) return true;
  const msg = (commit.message || '').toLowerCase();
  return keywords.some((kw) => msg.includes(kw.toLowerCase()));
}

/**
 * Returns true if the commit touches any file matching the given path prefix/substring.
 * @param {object} commit - must have a `files` array of strings
 * @param {string} pathFilter
 * @returns {boolean}
 */
function commitMatchesPath(commit, pathFilter) {
  if (!pathFilter) return true;
  const files = commit.files || [];
  const filter = pathFilter.toLowerCase();
  return files.some((f) => f.toLowerCase().includes(filter));
}

/**
 * Excludes commits whose messages match any of the given patterns (e.g. 'Merge', 'chore').
 * @param {object[]} commits
 * @param {string[]} excludePatterns
 * @returns {object[]}
 */
function excludeByPattern(commits, excludePatterns) {
  if (!excludePatterns || excludePatterns.length === 0) return commits;
  return commits.filter(
    (c) => !excludePatterns.some((p) => (c.message || '').toLowerCase().includes(p.toLowerCase()))
  );
}

/**
 * Applies all active filters to a list of commits.
 * @param {object[]} commits
 * @param {object} options
 * @param {string[]} [options.keywords]
 * @param {string} [options.pathFilter]
 * @param {string[]} [options.exclude]
 * @returns {object[]}
 */
function filterCommits(commits, options = {}) {
  const { keywords, pathFilter, exclude } = options;
  let result = commits;
  result = result.filter((c) => commitMatchesKeyword(c, keywords));
  result = result.filter((c) => commitMatchesPath(c, pathFilter));
  result = excludeByPattern(result, exclude);
  return result;
}

module.exports = { commitMatchesKeyword, commitMatchesPath, excludeByPattern, filterCommits };
