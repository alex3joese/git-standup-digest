// commitRecap.js — builds a human-readable end-of-day recap summary

'use strict';

const { groupByRepo } = require('./formatDigest');
const { buildTagStats } = require('./tagSummary');
const { buildVelocitySummary } = require('./commitVelocity');

/**
 * Returns the top N repos by commit count.
 * @param {object} grouped - result of groupByRepo
 * @param {number} n
 */
function topRepos(grouped, n = 3) {
  return Object.entries(grouped)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, n)
    .map(([repo, commits]) => ({ repo, count: commits.length }));
}

/**
 * Picks a motivational sign-off line based on commit count.
 * @param {number} total
 */
function signOff(total) {
  if (total === 0) return 'No commits today — rest up!';
  if (total < 3) return 'Slow day, but every commit counts.';
  if (total < 8) return 'Solid work today!';
  if (total < 15) return 'Crushing it — great output!';
  return 'Legendary day. Take a break!';
}

/**
 * Builds a full recap object for the given commits.
 * @param {Array} commits
 * @param {string} author
 * @returns {object}
 */
function buildRecap(commits, author) {
  const grouped = groupByRepo(commits);
  const repoCount = Object.keys(grouped).length;
  const totalCommits = commits.length;
  const velocity = buildVelocitySummary(commits);
  const tagStats = buildTagStats(commits);
  const repos = topRepos(grouped);

  return {
    author,
    totalCommits,
    repoCount,
    topRepos: repos,
    busiestDay: velocity.busiestDay,
    tagStats,
    signOff: signOff(totalCommits),
  };
}

/**
 * Formats the recap as a printable string.
 * @param {object} recap
 * @returns {string}
 */
function formatRecap(recap) {
  const lines = [];
  lines.push(`📋 Daily Recap for ${recap.author}`);
  lines.push(`   ${recap.totalCommits} commit(s) across ${recap.repoCount} repo(s)`);

  if (recap.topRepos.length > 0) {
    lines.push('\n🏆 Top Repos:');
    recap.topRepos.forEach(({ repo, count }) => {
      lines.push(`   ${repo}: ${count} commit(s)`);
    });
  }

  if (recap.busiestDay) {
    lines.push(`\n📅 Busiest day: ${recap.busiestDay.date} (${recap.busiestDay.count} commits)`);
  }

  const topTags = Object.entries(recap.tagStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (topTags.length > 0) {
    lines.push('\n🏷  Commit types:');
    topTags.forEach(([tag, count]) => lines.push(`   ${tag}: ${count}`));
  }

  lines.push(`\n✨ ${recap.signOff}`);
  return lines.join('\n');
}

module.exports = { topRepos, signOff, buildRecap, formatRecap };
