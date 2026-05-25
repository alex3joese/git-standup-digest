const { buildPaceSummary, formatPaceReport } = require('./commitPaceAnalyzer');

function printPaceHeader(date) {
  const label = date || new Date().toDateString();
  console.log(`\n⏱  Commit Pace — ${label}\n`);
}

function handlePaceCommand(commits, options = {}) {
  const { date, silent } = options;

  if (!commits || commits.length === 0) {
    if (!silent) console.log('No commits found for pace analysis.');
    return null;
  }

  const summary = buildPaceSummary(commits);
  const report = formatPaceReport(summary);

  if (!silent) {
    printPaceHeader(date);
    console.log(report);
  }

  return summary;
}

module.exports = { printPaceHeader, handlePaceCommand };
