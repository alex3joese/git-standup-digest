/**
 * timelineCommand.js
 * CLI handler for the --timeline flag.
 * Renders a time-bucketed view of today's commits.
 */

const { buildTimeline } = require('./commitTimeline');

/**
 * Prints a timeline header.
 * @param {string} dateLabel
 */
function printTimelineHeader(dateLabel) {
  const line = '─'.repeat(40);
  console.log(line);
  console.log(`  Commit Timeline — ${dateLabel}`);
  console.log(line);
}

/**
 * Formats a Date for display in the header.
 * @param {Date} date
 * @returns {string}
 */
function formatHeaderDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Handles the --timeline command.
 * Fetches commits, builds a timeline, and prints it.
 *
 * @param {Array<object>} commits - already-fetched commit objects
 * @param {object} options
 * @param {Date}   [options.date=new Date()] - reference date for header
 * @param {function} [options.log=console.log] - output function
 */
function handleTimelineCommand(commits, options = {}) {
  const { date = new Date(), log = console.log } = options;

  if (!commits || commits.length === 0) {
    log('No commits found for timeline.');
    return;
  }

  const dateLabel = formatHeaderDate(date);
  printTimelineHeader(dateLabel);

  const timeline = buildTimeline(commits);
  log('');
  log(timeline);
  log('');
  log(`Total commits: ${commits.length}`);
}

module.exports = { handleTimelineCommand, formatHeaderDate, printTimelineHeader };
