// velocityCommand.js — CLI handler for the --velocity report
const { buildVelocitySummary } = require('./commitVelocity');

/**
 * Renders a simple bar for a given count relative to peak
 * @param {number} count
 * @param {number} peak
 * @param {number} width
 * @returns {string}
 */
function renderBar(count, peak, width = 20) {
  if (peak === 0) return '';
  const filled = Math.round((count / peak) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

/**
 * Formats the velocity report as a string
 * @param {Object} summary
 * @returns {string}
 */
function formatVelocityReport(summary) {
  const { totalCommits, totalDays, averagePerDay, busiestDay, dayMap } = summary;
  const lines = [];
  lines.push('📈 Commit Velocity Report');
  lines.push('─'.repeat(40));
  lines.push(`Total commits : ${totalCommits}`);
  lines.push(`Active days   : ${totalDays}`);
  lines.push(`Avg / day     : ${averagePerDay}`);
  if (busiestDay) {
    lines.push(`Busiest day   : ${busiestDay.date} (${busiestDay.count} commits)`);
  }
  lines.push('');
  lines.push('Daily breakdown:');
  const peak = busiestDay ? busiestDay.count : 0;
  const sorted = Object.keys(dayMap).sort();
  for (const day of sorted) {
    const count = dayMap[day];
    const bar = renderBar(count, peak);
    lines.push(`  ${day}  ${bar}  ${count}`);
  }
  return lines.join('\n');
}

/**
 * Handles the velocity command
 * @param {Array} commits
 * @param {{ output?: function }} opts
 */
function handleVelocityCommand(commits, opts = {}) {
  const out = opts.output || console.log;
  if (!commits || commits.length === 0) {
    out('No commits found for velocity report.');
    return;
  }
  const summary = buildVelocitySummary(commits);
  const report = formatVelocityReport(summary);
  out(report);
}

module.exports = { renderBar, formatVelocityReport, handleVelocityCommand };
