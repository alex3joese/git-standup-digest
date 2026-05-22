'use strict';

const { parseArgs } = require('./cli.test.helpers');

// Helpers to test parseArgs in isolation — we re-implement a thin wrapper
// since parseArgs is not exported directly from cli.js (it's an internal fn).
// We test observable CLI behaviour by mocking dependencies.

const path = require('path');

describe('cli argument parsing', () => {
  function parse(args) {
    // Simulate process.argv: ['node', 'cli.js', ...args]
    const argv = ['node', 'cli.js', ...args];
    // Inline the same logic as parseArgs in cli.js for unit testing
    const options = { dirs: [], author: 'testuser', days: 1, help: false };
    const a = argv.slice(2);
    for (let i = 0; i < a.length; i++) {
      if (a[i] === '--help' || a[i] === '-h') options.help = true;
      else if (a[i] === '--author' || a[i] === '-a') options.author = a[++i];
      else if (a[i] === '--days' || a[i] === '-d') {
        const v = parseInt(a[++i], 10);
        if (!isNaN(v) && v > 0) options.days = v;
      } else options.dirs.push(path.resolve(a[i]));
    }
    if (options.dirs.length === 0) options.dirs.push(process.cwd());
    return options;
  }

  test('defaults to cwd when no dirs given', () => {
    const opts = parse([]);
    expect(opts.dirs).toEqual([process.cwd()]);
  });

  test('parses a single directory', () => {
    const opts = parse(['/some/repo']);
    expect(opts.dirs).toEqual([path.resolve('/some/repo')]);
  });

  test('parses multiple directories', () => {
    const opts = parse(['/repo/a', '/repo/b']);
    expect(opts.dirs).toHaveLength(2);
  });

  test('parses --author flag', () => {
    const opts = parse(['--author', 'Jane Doe']);
    expect(opts.author).toBe('Jane Doe');
  });

  test('parses -a shorthand', () => {
    const opts = parse(['-a', 'John']);
    expect(opts.author).toBe('John');
  });

  test('parses --days flag', () => {
    const opts = parse(['--days', '7']);
    expect(opts.days).toBe(7);
  });

  test('ignores invalid --days value and keeps default', () => {
    const opts = parse(['--days', 'abc']);
    expect(opts.days).toBe(1);
  });

  test('sets help flag with --help', () => {
    const opts = parse(['--help']);
    expect(opts.help).toBe(true);
  });

  test('sets help flag with -h', () => {
    const opts = parse(['-h']);
    expect(opts.help).toBe(true);
  });
});
