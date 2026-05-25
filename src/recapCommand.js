'use strict';

const { buildRecap, formatRecap } = require('./commitRecap');
const { resolveAuthorFilter } = require('./authorFilter');
const { filterByAuthor } = require('./authorFilter');

/**
 * Prints the recap header.
 * @param {string} author
 */
function printRecapHeader(author) {
  console.log('\n' + '='.repeat(48));
  console.log(`  git-standup-digest — Daily Recap`);
  if (author) console.log(`  Author: ${author}`);
  console.log('='.repeat(48) + '\n');
}

/**
 * Handles the `recap` sub-command.
 * @param {Array} commits - all resolved commits
 * @param {object} args - parsed CLI args
 */
async function handleRecapCommand(commits, args) {
  const authorFilter = await resolveAuthorFilter(args);
  const filtered = authorFilter ? filterByAuthor(commits, authorFilter) : commits;

  const author = authorFilter || 'everyone';
  const recap = buildRecap(filtered, author);
  const output = formatRecap(recap);

  printRecapHeader(author);
  console.log(output);
  console.log();
}

module.exports = { printRecapHeader, handleRecapCommand };
