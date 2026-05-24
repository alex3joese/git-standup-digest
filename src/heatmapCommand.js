'use strict';

const { renderHeatmap } = require('./commitHeatmap');
const { getCommits } = require('./gitLog');
const { resolveRepoPaths } = require('./repoScanner');
const { buildDateRange } = require('./dateRange');
const { resolveAuthorFilter, filterByAuthor } = require('./authorFilter');

/**
 * Prints a header for the heatmap output.
 * @param {number} totalCommits
 * @param {string[]} repos
 */
function printHeatmapHeader(totalCommits, repos) {
  console.log(`\n📊 Commit Heatmap — ${totalCommits} commit(s) across ${repos.length} repo(s)\n`);
}

/**
 * Collects all commits from the given repos within the date range.
 * @param {string[]} repoPaths
 * @param {{since: string, until: string}} dateRange
 * @param {string|null} author
 * @returns {Promise<Array>}
 */
async function collectCommits(repoPaths, dateRange, author) {
  const all = [];
  for (const repo of repoPaths) {
    try {
      const commits = await getCommits(repo, dateRange);
      const filtered = author ? filterByAuthor(commits, author) : commits;
      all.push(...filtered);
    } catch {
      // skip repos that fail
    }
  }
  return all;
}

/**
 * Main handler for the `heatmap` CLI command.
 * @param {object} args  parsed CLI args
 * @param {object} config  loaded config
 */
async function handleHeatmapCommand(args, config) {
  const days = args.days || config.days || 7;
  const rawRepos = args.repos || config.repos || ['.'];
  const repoPaths = await resolveRepoPaths(rawRepos);
  const dateRange = buildDateRange(days);
  const author = await resolveAuthorFilter(args, config);

  const commits = await collectCommits(repoPaths, dateRange, author);

  if (commits.length === 0) {
    console.log('No commits found for heatmap.');
    return;
  }

  printHeatmapHeader(commits.length, repoPaths);
  console.log(renderHeatmap(commits));
  console.log();
}

module.exports = { handleHeatmapCommand, printHeatmapHeader, collectCommits };
