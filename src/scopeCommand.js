const { buildScopeSummary, groupByScope } = require('./commitScopeAnalyzer');

function printScopeHeader(date) {
  const label = date || new Date().toDateString();
  console.log(`\n🔍 Commit Scope Breakdown — ${label}\n`);
}

function formatScopeRow(entry) {
  const bar = '█'.repeat(Math.min(entry.count, 20));
  const repoStr = entry.repos.length ? `  [${entry.repos.join(', ')}]` : '';
  return `  ${entry.scope.padEnd(24)} ${bar} ${entry.count}${repoStr}`;
}

function formatScopeReport(summary) {
  if (!summary.length) return '  No commits found.';
  return summary.map(formatScopeRow).join('\n');
}

function handleScopeCommand(commits, { date } = {}) {
  if (!commits || !commits.length) {
    console.log('No commits to analyze.');
    return;
  }
  const summary = buildScopeSummary(commits);
  printScopeHeader(date);
  console.log(formatScopeReport(summary));
  console.log(`\n  Total scopes: ${summary.length}`);
  console.log();
}

module.exports = { printScopeHeader, formatScopeRow, formatScopeReport, handleScopeCommand };
