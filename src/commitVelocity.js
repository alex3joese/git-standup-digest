// commitVelocity.js — measures commit rate over time windows

/**
 * Groups commits by day and returns a map of dateString -> count
 * @param {Array} commits
 * @returns {Object}
 */
function commitsByDay(commits) {
  const map = {};
  for (const commit of commits) {
    const day = commit.date ? commit.date.slice(0, 10) : null;
    if (!day) continue;
    map[day] = (map[day] || 0) + 1;
  }
  return map;
}

/**
 * Computes average commits per active day
 * @param {Object} dayMap
 * @returns {number}
 */
function averagePerDay(dayMap) {
  const days = Object.values(dayMap);
  if (!days.length) return 0;
  const total = days.reduce((sum, n) => sum + n, 0);
  return parseFloat((total / days.length).toFixed(2));
}

/**
 * Finds the busiest day
 * @param {Object} dayMap
 * @returns {{ date: string, count: number } | null}
 */
function busiestDay(dayMap) {
  const entries = Object.entries(dayMap);
  if (!entries.length) return null;
  const [date, count] = entries.reduce((best, curr) => (curr[1] > best[1] ? curr : best));
  return { date, count };
}

/**
 * Builds a full velocity summary
 * @param {Array} commits
 * @returns {Object}
 */
function buildVelocitySummary(commits) {
  const dayMap = commitsByDay(commits);
  const totalDays = Object.keys(dayMap).length;
  const totalCommits = commits.length;
  const avg = averagePerDay(dayMap);
  const peak = busiestDay(dayMap);
  return { totalCommits, totalDays, averagePerDay: avg, busiestDay: peak, dayMap };
}

module.exports = { commitsByDay, averagePerDay, busiestDay, buildVelocitySummary };
