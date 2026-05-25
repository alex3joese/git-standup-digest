const { buildFocusSummary } = require('./commitFocusScore');

/**
 * Render a simple bar representing the focus score.
 * @param {number} score 0-100
 * @param {number} width
 * @returns {string}
 */
function renderFocusBar(score, width = 20) {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

/**
 * Format the focus report for stdout.
 * @param {{ score: number, label: string, typeCounts: Record<string, number> }} summary
 * @returns {string}
 */
function formatFocusReport(summary) {
  const lines = [];
  lines.push(`\n🎯 Focus Score: ${summary.score}/100  ${renderFocusBar(summary.score)}`);
  lines.push(`   ${summary.label}\n`);
  lines.push('   Commit type breakdown:');
  const sorted = Object.entries(summary.typeCounts).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sorted) {
    lines.push(`     ${type.padEnd(12)} ${count} commit${count !== 1 ? 's' : ''}`);
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Handle the `focus` sub-command.
 * @param {object[]} commits
 * @param {{ print?: (s: string) => void }} opts
 */
function handleFocusCommand(commits, opts = {}) {
  const print = opts.print || console.log;
  if (!commits || commits.length === 0) {
    print('No commits found for focus analysis.');
    return;
  }
  const summary = buildFocusSummary(commits);
  print(formatFocusReport(summary));
}

module.exports = { renderFocusBar, formatFocusReport, handleFocusCommand };
