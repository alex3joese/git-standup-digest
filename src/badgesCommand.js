const { earnedBadges, formatBadges } = require('./commitBadges');
const { buildStreakSummary } = require('./commitStreak');

function printBadgesHeader(date) {
  const label = date || new Date().toDateString();
  console.log(`\n🏅 Commit Badges — ${label}`);
  console.log('─'.repeat(40));
}

function formatBadgesReport(commits, options = {}) {
  const { streakLength = 0, author = null } = options;
  const lines = [];

  if (author) {
    lines.push(`Author: ${author}`);
  }

  lines.push(`Commits analysed: ${commits.length}`);

  const badges = earnedBadges(commits, streakLength);
  lines.push(`\nBadges earned (${badges.length}):`);
  lines.push(formatBadges(badges));

  return lines.join('\n');
}

function handleBadgesCommand(commits, options = {}) {
  const { author, since, streakLength } = options;

  let filtered = commits;
  if (author) {
    filtered = commits.filter(c =>
      c.author && c.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (!filtered.length) {
    console.log('No commits found for badge evaluation.');
    return;
  }

  printBadgesHeader(since);
  const report = formatBadgesReport(filtered, { streakLength, author });
  console.log(report);
  console.log();
}

module.exports = { printBadgesHeader, formatBadgesReport, handleBadgesCommand };
