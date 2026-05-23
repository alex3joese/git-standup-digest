// healthCommand.js — CLI handler for the `health` subcommand

const { buildHealthReport } = require('./repoHealth');

/**
 * Formats a health score as a visual bar (e.g. [████░░░░░░] 60)
 */
function formatScoreBar(score, width = 10) {
  if (score === null) return '[n/a]';
  const filled = Math.round((score / 100) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return `[${bar}] ${score}`;
}

/**
 * Renders a health report for a single repo to a string
 */
function formatHealthReport(repoName, report) {
  const lines = [
    `\n📊 Health Report: ${repoName}`,
    `  Commits analyzed : ${report.total}`,
    `  Merge commits     : ${report.mergeCount}`,
    `  Vague messages    : ${report.vagueCount}`,
    `  Score             : ${formatScoreBar(report.score)}`,
    `  Rating            : ${report.rating.toUpperCase()}`,
  ];
  return lines.join('\n');
}

/**
 * Groups commits by repo name
 */
function groupCommitsByRepo(commits) {
  return commits.reduce((acc, commit) => {
    const key = commit.repo || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(commit);
    return acc;
  }, {});
}

/**
 * Main handler for the health command
 */
function handleHealthCommand(commits, options = {}) {
  const { output = process.stdout } = options;

  if (!commits || commits.length === 0) {
    output.write('No commits found to analyze.\n');
    return;
  }

  const byRepo = groupCommitsByRepo(commits);
  const repos = Object.keys(byRepo).sort();

  for (const repo of repos) {
    const report = buildHealthReport(byRepo[repo]);
    const text = formatHealthReport(repo, report);
    output.write(text + '\n');
  }

  output.write(`\n✅ Analyzed ${repos.length} repo(s), ${commits.length} commit(s) total.\n`);
}

module.exports = {
  formatScoreBar,
  formatHealthReport,
  groupCommitsByRepo,
  handleHealthCommand,
};
