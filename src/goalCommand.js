const { buildGoalSummary, formatGoalReport } = require('./commitGoalTracker');
const { loadConfig } = require('./config');

const GOAL_CONFIG_KEY = 'dailyCommitGoal';

/**
 * @param {object} args - parsed CLI args
 * @param {object[]} commits - all commits
 * @param {{ log?: Function, error?: Function }} [io]
 */
function handleGoalCommand(args, commits, io = {}) {
  const log = io.log || console.log;
  const error = io.error || console.error;

  if (args.set) {
    const val = parseInt(args.set, 10);
    if (isNaN(val) || val < 1) {
      error('Goal must be a positive integer.');
      return;
    }
    const config = loadConfig();
    const { saveConfig } = require('./config');
    saveConfig({ ...config, [GOAL_CONFIG_KEY]: val });
    log(`✅ Daily commit goal set to ${val}.`);
    return;
  }

  const config = loadConfig();
  const goal = config[GOAL_CONFIG_KEY] || 5;
  const dateStr = args.date || new Date().toISOString().slice(0, 10);

  const summary = buildGoalSummary(commits, goal, dateStr);
  log(formatGoalReport(summary));
}

module.exports = { handleGoalCommand, GOAL_CONFIG_KEY };
