#!/usr/bin/env node

'use strict';

const path = require('path');
const { getCommits } = require('./gitLog');
const { formatDigest } = require('./formatDigest');

const DEFAULT_AUTHOR = process.env.GIT_AUTHOR_NAME || require('os').userInfo().username;
const DEFAULT_DAYS = 1;

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    dirs: [],
    author: DEFAULT_AUTHOR,
    days: DEFAULT_DAYS,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--author' || arg === '-a') {
      options.author = args[++i];
    } else if (arg === '--days' || arg === '-d') {
      const val = parseInt(args[++i], 10);
      if (!isNaN(val) && val > 0) options.days = val;
    } else {
      options.dirs.push(path.resolve(arg));
    }
  }

  if (options.dirs.length === 0) {
    options.dirs.push(process.cwd());
  }

  return options;
}

function printHelp() {
  console.log(`
git-standup-digest — daily standup summary from recent git commits

Usage:
  git-standup-digest [dirs...] [options]

Options:
  -a, --author <name>   Git author name to filter by (default: current user)
  -d, --days <n>        Number of days to look back (default: 1)
  -h, --help            Show this help message

Examples:
  git-standup-digest
  git-standup-digest ~/projects/foo ~/projects/bar
  git-standup-digest --author "Jane Doe" --days 3
`);
}

async function main() {
  const options = parseArgs(process.argv);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const allCommits = [];

  for (const dir of options.dirs) {
    try {
      const commits = await getCommits(dir, { author: options.author, days: options.days });
      allCommits.push(...commits);
    } catch (err) {
      console.error(`Warning: could not read commits from ${dir}: ${err.message}`);
    }
  }

  if (allCommits.length === 0) {
    console.log('No commits found for the given criteria.');
    process.exit(0);
  }

  const digest = formatDigest(allCommits);
  console.log(digest);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
