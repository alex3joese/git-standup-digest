// commitSearch.js — search/filter commits by keyword, author, date, or repo

/**
 * Build a search predicate from a query object.
 * @param {object} query - { keyword, author, repo, since, until }
 * @returns {function} predicate(commit) => boolean
 */
function buildSearchPredicate(query = {}) {
  const { keyword, author, repo, since, until } = query;
  const kwLower = keyword ? keyword.toLowerCase() : null;
  const authorLower = author ? author.toLowerCase() : null;
  const repoLower = repo ? repo.toLowerCase() : null;
  const sinceTs = since ? new Date(since).getTime() : null;
  const untilTs = until ? new Date(until).getTime() : null;

  return function predicate(commit) {
    if (kwLower && !commit.message.toLowerCase().includes(kwLower)) return false;
    if (authorLower && !commit.author.toLowerCase().includes(authorLower)) return false;
    if (repoLower && !(commit.repo || '').toLowerCase().includes(repoLower)) return false;
    if (sinceTs) {
      const ts = new Date(commit.date).getTime();
      if (isNaN(ts) || ts < sinceTs) return false;
    }
    if (untilTs) {
      const ts = new Date(commit.date).getTime();
      if (isNaN(ts) || ts > untilTs) return false;
    }
    return true;
  };
}

/**
 * Search commits using a query object.
 * @param {object[]} commits
 * @param {object} query
 * @returns {object[]}
 */
function searchCommits(commits, query) {
  if (!Array.isArray(commits)) return [];
  const predicate = buildSearchPredicate(query);
  return commits.filter(predicate);
}

/**
 * Highlight occurrences of a keyword in a string (for terminal output).
 * @param {string} text
 * @param {string} keyword
 * @returns {string}
 */
function highlightKeyword(text, keyword) {
  if (!keyword || !text) return text;
  const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return text.replace(regex, (match) => `\x1b[33m${match}\x1b[0m`);
}

module.exports = { buildSearchPredicate, searchCommits, highlightKeyword };
