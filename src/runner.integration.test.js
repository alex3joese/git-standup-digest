import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { run } from './runner.js';
import * as gitLog from './gitLog.js';
import * as config from './config.js';
import * as output from './output.js';
import * as dateRange from './dateRange.js';

beforeEach(() => {
  vi.spyOn(config, 'loadConfig').mockReturnValue({
    author: 'Dev User',
    days: 1,
    repos: ['/project/alpha', '/project/beta'],
    output: null,
  });

  vi.spyOn(dateRange, 'buildDateRange').mockReturnValue({
    since: '2024-06-10T00:00:00',
    until: '2024-06-11T00:00:00',
  });

  vi.spyOn(gitLog, 'getCommits').mockImplementation(async ({ repo }) => {
    if (repo === '/project/alpha') {
      return [
        { repo, hash: 'aaa111', message: 'feat: add login page', date: '2024-06-10' },
        { repo, hash: 'aaa222', message: 'fix: correct redirect', date: '2024-06-10' },
      ];
    }
    if (repo === '/project/beta') {
      return [
        { repo, hash: 'bbb111', message: 'chore: update deps', date: '2024-06-10' },
      ];
    }
    return [];
  });

  vi.spyOn(output, 'outputDigest').mockResolvedValue();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('runner integration', () => {
  it('collects commits from multiple repos and outputs digest', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await run([]);
    expect(gitLog.getCommits).toHaveBeenCalledTimes(2);
    expect(output.outputDigest).toHaveBeenCalledTimes(1);
    const digestArg = output.outputDigest.mock.calls[0][0];
    expect(digestArg).toContain('alpha');
    expect(digestArg).toContain('beta');
    expect(digestArg).toContain('add login page');
    expect(digestArg).toContain('update deps');
  });
});
