import { parseArgs } from './cli.js';
import { loadConfig } from './config.js';
import { buildDateRange } from './dateRange.js';
import { getCommits } from './gitLog.js';
import { formatDigest } from './formatDigest.js';
import { outputDigest } from './output.js';
import { handleConfigCommand } from './configCommand.js';

export async function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  if (args.configCommand) {
    return handleConfigCommand(args.configCommand, args.configArgs);
  }

  const config = loadConfig();

  const options = {
    author: args.author ?? config.author,
    days: args.days ?? config.days ?? 1,
    repos: args.repos ?? config.repos ?? [process.cwd()],
    output: args.output ?? config.output ?? null,
  };

  if (!options.author) {
    console.error('Error: No author specified. Use --author or set it via `git-standup config set author <name>`.');
    process.exit(1);
  }

  const { since, until } = buildDateRange(options.days);

  const allCommits = [];
  for (const repo of options.repos) {
    try {
      const commits = await getCommits({ repo, author: options.author, since, until });
      allCommits.push(...commits);
    } catch (err) {
      console.warn(`Warning: Could not read commits from ${repo}: ${err.message}`);
    }
  }

  if (allCommits.length === 0) {
    console.log('No commits found for the given period.');
    return;
  }

  const digest = formatDigest(allCommits);
  await outputDigest(digest, options.output);
}
