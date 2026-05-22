import { describe, it, expect, vi, beforeEach } from 'vitest';
import { run } from './runner.js';

vi.mock('./cli.js');
vi.mock('./config.js');
vi.mock('./dateRange.js');
vi.mock('./gitLog.js');
vi.mock('./formatDigest.js');
vi.mock('./output.js');
vi.mock('./configCommand.js');

import { parseArgs } from './cli.js';
import { loadConfig } from './config.js';
import { buildDateRange } from './dateRange.js';
import { getCommits } from './gitLog.js';
import { formatDigest } from './formatDigest.js';
import { outputDigest } from './output.js';
import { handleConfigCommand } from './configCommand.js';

beforeEach(() => {
  vi.clearAllMocks();
  loadConfig.mockReturnValue({ author: 'Alice', days: 1, repos: ['/repo'], output: null });
  buildDateRange.mockReturnValue({ since: '2024-01-01', until: '2024-01-02' });
  getCommits.mockResolvedValue([{ repo: '/repo', hash: 'abc', message: 'fix bug' }]);
  formatDigest.mockReturnValue('## Digest\n- fix bug');
  outputDigest.mockResolvedValue();
});

describe('run', () => {
  it('delegates to handleConfigCommand when configCommand is present', async () => {
    parseArgs.mockReturnValue({ configCommand: 'set', configArgs: ['author', 'Bob'] });
    handleConfigCommand.mockResolvedValue();
    await run(['config', 'set', 'author', 'Bob']);
    expect(handleConfigCommand).toHaveBeenCalledWith('set', ['author', 'Bob']);
    expect(getCommits).not.toHaveBeenCalled();
  });

  it('runs full digest pipeline', async () => {
    parseArgs.mockReturnValue({ author: null, days: null, repos: null, output: null });
    await run([]);
    expect(getCommits).toHaveBeenCalledWith({ repo: '/repo', author: 'Alice', since: '2024-01-01', until: '2024-01-02' });
    expect(formatDigest).toHaveBeenCalled();
    expect(outputDigest).toHaveBeenCalledWith('## Digest\n- fix bug', null);
  });

  it('prints message when no commits found', async () => {
    parseArgs.mockReturnValue({ author: 'Alice', days: 1, repos: ['/repo'], output: null });
    getCommits.mockResolvedValue([]);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await run([]);
    expect(consoleSpy).toHaveBeenCalledWith('No commits found for the given period.');
    expect(outputDigest).not.toHaveBeenCalled();
  });

  it('warns and continues when a repo fails', async () => {
    parseArgs.mockReturnValue({ author: 'Alice', days: 1, repos: ['/bad', '/good'], output: null });
    loadConfig.mockReturnValue({ author: 'Alice', days: 1, repos: ['/bad', '/good'], output: null });
    getCommits
      .mockRejectedValueOnce(new Error('not a git repo'))
      .mockResolvedValueOnce([{ repo: '/good', hash: 'def', message: 'add feature' }]);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await run([]);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('/bad'));
    expect(formatDigest).toHaveBeenCalled();
  });
});
