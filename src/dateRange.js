/**
 * Utilities for computing date ranges used in git log queries.
 */

/**
 * Returns a Date object representing the start of "today" (midnight local time).
 */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns a Date object for N days ago from the given base date.
 * @param {number} days
 * @param {Date} [from=new Date()]
 */
function daysAgo(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Formats a Date as a string acceptable by `git log --after` / `--before`.
 * Format: YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
function formatGitDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Builds a { since, until } object for a given number of days back.
 * `since` is the start of `days` ago, `until` is the end of today.
 * @param {number} days  1 = today only, 2 = yesterday + today, etc.
 * @returns {{ since: string, until: string }}
 */
function buildDateRange(days = 1) {
  if (!Number.isInteger(days) || days < 1) {
    throw new RangeError(`days must be a positive integer, got: ${days}`);
  }
  const until = new Date();
  until.setHours(23, 59, 59, 999);
  const since = daysAgo(days - 1);
  return {
    since: formatGitDate(since),
    until: formatGitDate(until),
  };
}

module.exports = { startOfToday, daysAgo, formatGitDate, buildDateRange };
