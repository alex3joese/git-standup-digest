/**
 * commitStreak.js
 * Computes commit streaks (consecutive days with commits) from a list of commits.
 */

const { startOfToday, daysAgo } = require('./dateRange');

/**
 * Normalize a Date or ISO string to a YYYY-MM-DD string.
 */
function toDateString(dateOrStr) {
  const d = new Date(dateOrStr);
  return d.toISOString().slice(0, 10);
}

/**
 * Get unique commit days (YYYY-MM-DD) sorted descending.
 */
function getUniqueDays(commits) {
  const days = new Set(commits.map(c => toDateString(c.date)));
  return Array.from(days).sort((a, b) => (a < b ? 1 : -1));
}

/**
 * Compute the current streak: consecutive days ending today or yesterday.
 */
function computeCurrentStreak(commits) {
  const days = getUniqueDays(commits);
  if (days.length === 0) return 0;

  const today = toDateString(new Date());
  const yesterday = toDateString(daysAgo(1));

  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffMs = prev - curr;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Compute the longest streak in the commit history.
 */
function computeLongestStreak(commits) {
  const days = getUniqueDays(commits);
  if (days.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

/**
 * Build a full streak summary object.
 */
function buildStreakSummary(commits) {
  return {
    totalDays: getUniqueDays(commits).length,
    currentStreak: computeCurrentStreak(commits),
    longestStreak: computeLongestStreak(commits),
  };
}

module.exports = {
  toDateString,
  getUniqueDays,
  computeCurrentStreak,
  computeLongestStreak,
  buildStreakSummary,
};
