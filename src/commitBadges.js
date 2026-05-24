// Assigns achievement-style badges to commits based on patterns and stats

const BADGES = {
  centurion: { label: '💯 Centurion', description: '100+ commits in a single day' },
  nightOwl: { label: '🦉 Night Owl', description: 'Committed after midnight' },
  earlyBird: { label: '🐦 Early Bird', description: 'Committed before 6am' },
  prolific: { label: '✍️ Prolific', description: '10+ commits in one session' },
  streaker: { label: '🔥 Streaker', description: '7+ day commit streak' },
  fixer: { label: '🔧 Fixer', description: 'Majority of commits are fixes' },
  shipper: { label: '🚀 Shipper', description: 'Includes a release or deploy commit' },
};

function getCommitHour(commit) {
  const d = new Date(commit.date);
  return d.getHours();
}

function isNightOwl(commits) {
  return commits.some(c => getCommitHour(c) >= 0 && getCommitHour(c) < 3);
}

function isEarlyBird(commits) {
  return commits.some(c => getCommitHour(c) >= 4 && getCommitHour(c) < 6);
}

function isProlific(commits) {
  return commits.length >= 10;
}

function isFixer(commits) {
  const fixes = commits.filter(c => /fix|bug|patch/i.test(c.message));
  return fixes.length > commits.length / 2;
}

function isShipper(commits) {
  return commits.some(c => /release|deploy|ship|publish/i.test(c.message));
}

function earnedBadges(commits, streakLength = 0) {
  const badges = [];
  if (isNightOwl(commits)) badges.push(BADGES.nightOwl);
  if (isEarlyBird(commits)) badges.push(BADGES.earlyBird);
  if (isProlific(commits)) badges.push(BADGES.prolific);
  if (isFixer(commits)) badges.push(BADGES.fixer);
  if (isShipper(commits)) badges.push(BADGES.shipper);
  if (streakLength >= 7) badges.push(BADGES.streaker);
  if (commits.length >= 100) badges.push(BADGES.centurion);
  return badges;
}

function formatBadges(badges) {
  if (!badges.length) return '  (no badges earned today)';
  return badges.map(b => `  ${b.label} — ${b.description}`).join('\n');
}

module.exports = { BADGES, earnedBadges, formatBadges, isNightOwl, isEarlyBird, isProlific, isFixer, isShipper };
