/**
 * commitCalendar.js
 * Builds a monthly calendar view of commit activity.
 */

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Returns 'YYYY-MM' string for a Date.
 * @param {Date} date
 * @returns {string}
 */
function toMonthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Returns 'YYYY-MM-DD' string for a Date.
 * @param {Date} date
 * @returns {string}
 */
function toDayKey(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Counts commits per day from a list of commits.
 * @param {Array<{date: string}>} commits
 * @returns {Object} map of 'YYYY-MM-DD' -> count
 */
function countByDay(commits) {
  return commits.reduce((acc, c) => {
    const key = toDayKey(new Date(c.date));
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Builds a calendar grid for a given month.
 * @param {string} monthKey 'YYYY-MM'
 * @param {Object} dayCounts map of 'YYYY-MM-DD' -> count
 * @returns {string[][]}
 */
function buildCalendarGrid(monthKey, dayCounts) {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const rows = [];
  let week = Array(firstDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${monthKey}-${String(d).padStart(2, '0')}`;
    week.push({ day: d, count: dayCounts[key] || 0 });
    if (week.length === 7) {
      rows.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    rows.push(week);
  }
  return rows;
}

/**
 * Renders a calendar as a string for the given month.
 * @param {string} monthKey
 * @param {Object} dayCounts
 * @returns {string}
 */
function renderCalendar(monthKey, dayCounts) {
  const grid = buildCalendarGrid(monthKey, dayCounts);
  const header = `  ${monthKey}\n  ${DAYS.join(' ')}`;
  const rows = grid.map(week =>
    '  ' + week.map(cell => {
      if (!cell) return '  ';
      return cell.count > 0 ? String(cell.day).padStart(2) : '--';
    }).join(' ')
  );
  return [header, ...rows].join('\n');
}

/**
 * Builds calendar data for all months represented in commits.
 * @param {Array<{date: string}>} commits
 * @returns {{ monthKey: string, rendered: string }[]}
 */
function buildCommitCalendar(commits) {
  const dayCounts = countByDay(commits);
  const months = [...new Set(commits.map(c => toMonthKey(new Date(c.date))))].sort();
  return months.map(monthKey => ({
    monthKey,
    rendered: renderCalendar(monthKey, dayCounts),
  }));
}

module.exports = {
  toMonthKey,
  toDayKey,
  countByDay,
  buildCalendarGrid,
  renderCalendar,
  buildCommitCalendar,
};
