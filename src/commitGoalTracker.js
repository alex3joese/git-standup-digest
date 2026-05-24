// Tracks progress toward a daily commit goal

const DEFAULT_GOAL = 5;

/**
 * @param {object[]} commits
 * @param {string} dateString - 'YYYY-MM-DD'
 * @returns {object[]}
 */
function commitsOnDay(commits, dateString) {
  return commits.filter((c) => {
    const d = new Date(c.date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}` === dateString;
  });
}

/**
 * @param {object[]} commits
 * @param {number} goal
 * @param {string} [dateString] - defaults to today
 * @returns {{ count: number, goal: number, remaining: number, met: boolean, percent: number }}
 */
function buildGoalSummary(commits, goal = DEFAULT_GOAL, dateString) {
  const today = dateString || new Date().toISOString().slice(0, 10);
  const dayCommits = commitsOnDay(commits, today);
  const count = dayCommits.length;
  const remaining = Math.max(0, goal - count);
  const met = count >= goal;
  const percent = Math.min(100, Math.round((count / goal) * 100));
  return { count, goal, remaining, met, percent, date: today };
}

/**
 * @param {{ count: number, goal: number, remaining: number, met: boolean, percent: number, date: string }} summary
 * @param {number} [barWidth]
 * @returns {string}
 */
function renderGoalBar(summary, barWidth = 20) {
  const filled = Math.round((summary.percent / 100) * barWidth);
  const empty = barWidth - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${summary.percent}%`;
}

/**
 * @param {{ count: number, goal: number, remaining: number, met: boolean, percent: number, date: string }} summary
 * @returns {string}
 */
function formatGoalReport(summary) {
  const lines = [];
  lines.push(`📅 Commit Goal — ${summary.date}`);
  lines.push(renderGoalBar(summary));
  lines.push(`Commits today: ${summary.count} / ${summary.goal}`);
  if (summary.met) {
    lines.push('✅ Daily goal met!');
  } else {
    lines.push(`⏳ ${summary.remaining} more commit(s) to reach your goal.`);
  }
  return lines.join('\n');
}

module.exports = { commitsOnDay, buildGoalSummary, renderGoalBar, formatGoalReport, DEFAULT_GOAL };
