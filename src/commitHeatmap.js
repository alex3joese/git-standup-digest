/**
 * commitHeatmap.js
 * Builds a heatmap of commit activity by day-of-week and hour-of-day.
 */

'use strict';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HEAT_CHARS = [' ', '░', '▒', '▓', '█'];

/**
 * @param {Array<{date: string}>} commits
 * @returns {Record<string, number>} key: "day:hour"
 */
function buildHeatmapGrid(commits) {
  const grid = {};
  for (const commit of commits) {
    const d = new Date(commit.date);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getDay()}:${d.getHours()}`;
    grid[key] = (grid[key] || 0) + 1;
  }
  return grid;
}

/**
 * @param {Record<string, number>} grid
 * @returns {number}
 */
function maxGridValue(grid) {
  const vals = Object.values(grid);
  return vals.length ? Math.max(...vals) : 1;
}

/**
 * Maps a count to a heat character.
 * @param {number} count
 * @param {number} max
 * @returns {string}
 */
function heatChar(count, max) {
  if (count === 0 || max === 0) return HEAT_CHARS[0];
  const idx = Math.ceil((count / max) * (HEAT_CHARS.length - 1));
  return HEAT_CHARS[Math.min(idx, HEAT_CHARS.length - 1)];
}

/**
 * Renders a heatmap string (days as rows, hours 0-23 as columns).
 * @param {Array<{date: string}>} commits
 * @returns {string}
 */
function renderHeatmap(commits) {
  const grid = buildHeatmapGrid(commits);
  const max = maxGridValue(grid);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const header = '     ' + hours.map(h => String(h).padStart(2)).join(' ');
  const rows = DAYS.map((day, dayIdx) => {
    const cells = hours
      .map(h => ` ${heatChar(grid[`${dayIdx}:${h}`] || 0, max)} `)
      .join('');
    return `${day.padEnd(4)} ${cells}`;
  });

  return [header, ...rows].join('\n');
}

module.exports = { buildHeatmapGrid, maxGridValue, heatChar, renderHeatmap, DAYS };
