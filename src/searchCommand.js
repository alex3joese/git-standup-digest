// searchCommand.js — CLI handler for the `search` subcommand

const { searchCommits, highlightKeyword } = require('./commitSearch');
const { getCommits } = require('./gitLog');
const { resolveRepoPaths } = require('./repoScanner');
const { resolveAuthorFilter } = require('./authorFilter');
const { buildDateRange } = require('./dateRange');

/**
 * Format a single search result line.
 */
function formatSearchResult(commit, keyword) {
  const date = commit.date ? commit.date.slice(0, 10) : '????-??-??';
  const repo = commit.repo ? `[${commit.repo}] ` : '';
  const message = keyword ? highlightKeyword(commit.message, keyword) : commit.message;
  return `  ${date} ${repo}${commit.author}: ${message}`;
}

/**
 * Print search results to stdout.
 */
function printSearchResults(results, keyword) {
  if (results.length === 0) {
    console.log('No commits matched your search.');
    return;
  }
  console.log(`\nFound ${results.length} commit(s):\n`);
  for (const commit of results) {
    console.log(formatSearchResult(commit, keyword));
  }
  console.log();
}

/**
 * Main handler for the search subcommand.
 * @param {object} args - parsed CLI args
 * @param {object} config - loaded config
 */
async function handleSearchCommand(args, config) {
  const repos = await resolveRepoPaths(args.repos || config.repos || ['.']);
  const author = await resolveAuthorFilter(args.author || config.author);
  const { since, until } = buildDateRange(args.days || config.days || 1);

  const allCommits = [];
  for (const repo of repos) {
    const commits = await getCommits(repo, { since, until, author });
    for (const c of commits) allCommits.push({ ...c, repo });
  }

  const query = {
    keyword: args.keyword || args._[1] || null,
    author: args.author || null,
    repo: args.repo || null,
    since: args.since || null,
    until: args.until || null,
  };

  const results = searchCommits(allCommits, query);
  printSearchResults(results, query.keyword);
}

module.exports = { handleSearchCommand, formatSearchResult, printSearchResults };
