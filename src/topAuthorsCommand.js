const { buildTopAuthorsReport, topAuthors } = require('./commitTopAuthors');

/**
 * Print the header line for the top authors command.
 * @param {number} n
 * @param {string|null} since
 */
function printTopAuthorsHeader(n, since) {
  const dateLabel = since ? ` since ${since}` : ' (all loaded commits)';
  console.log(`\n👤 Top ${n} Authors${dateLabel}\n`);
}

/**
 * Handle the top-authors command.
 * @param {Array} commits - all loaded commits
 * @param {Object} opts
 * @param {number} [opts.n=5] - how many authors to show
 * @param {string|null} [opts.since=null] - label for date range
 * @param {boolean} [opts.json=false] - output raw JSON
 */
function handleTopAuthorsCommand(commits, opts = {}) {
  const { n = 5, since = null, json = false } = opts;

  if (json) {
    const data = topAuthors(commits, n);
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  printTopAuthorsHeader(n, since);
  const report = buildTopAuthorsReport(commits, n);
  console.log(report);
  console.log();
}

module.exports = { printTopAuthorsHeader, handleTopAuthorsCommand };
