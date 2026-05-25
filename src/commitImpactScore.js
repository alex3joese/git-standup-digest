/**
 * Computes an "impact score" for commits based on diff stats,
 * message signals, and recency.
 */

const BREAKING_BONUS = 20;
const HOTFIX_BONUS = 15;
const LINES_WEIGHT = 0.05;
const FILES_WEIGHT = 2;
const RECENCY_DECAY_DAYS = 7;

function daysSince(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const ms = now - then;
  return Math.max(0, ms / (1000 * 60 * 60 * 24));
}

function recencyMultiplier(dateStr) {
  const days = daysSince(dateStr);
  return Math.max(0.1, 1 - days / (RECENCY_DECAY_DAYS * 2));
}

function scoreCommit(commit) {
  const { message = '', diffStat, date } = commit;
  let score = 10; // base

  if (diffStat) {
    score += (diffStat.insertions || 0) * LINES_WEIGHT;
    score += (diffStat.deletions || 0) * LINES_WEIGHT;
    score += (diffStat.filesChanged || 0) * FILES_WEIGHT;
  }

  const lower = message.toLowerCase();
  if (/breaking[- ]change|!:/i.test(message)) score += BREAKING_BONUS;
  if (/hotfix|critical|urgent/i.test(lower)) score += HOTFIX_BONUS;
  if (/feat:|feature/i.test(lower)) score += 8;
  if (/fix:|bugfix/i.test(lower)) score += 5;
  if (/refactor/i.test(lower)) score += 4;
  if (/chore:|docs:|style:/i.test(lower)) score += 1;

  if (date) score *= recencyMultiplier(date);

  return Math.round(score * 10) / 10;
}

function annotateCommitsWithImpact(commits) {
  return commits.map(c => ({ ...c, impactScore: scoreCommit(c) }));
}

function buildImpactSummary(commits) {
  const annotated = annotateCommitsWithImpact(commits);
  const sorted = [...annotated].sort((a, b) => b.impactScore - a.impactScore);
  const total = annotated.reduce((s, c) => s + c.impactScore, 0);
  const avg = annotated.length ? Math.round((total / annotated.length) * 10) / 10 : 0;
  return { commits: annotated, topCommits: sorted.slice(0, 5), averageScore: avg, totalScore: Math.round(total * 10) / 10 };
}

module.exports = { scoreCommit, recencyMultiplier, annotateCommitsWithImpact, buildImpactSummary };
