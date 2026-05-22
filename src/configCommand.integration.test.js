import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { handleConfigCommand } from './configCommand.js';
import { loadConfig, getConfigPath, resetConfig } from './config.js';

// Integration tests using the real filesystem via a temp dir
const TEMP_CONFIG = path.join(os.tmpdir(), `.git-standup-test-${Date.now()}.json`);

vi.mock('os', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, homedir: () => path.dirname(TEMP_CONFIG) };
});

describe('config integration', () => {
  beforeEach(() => {
    if (fs.existsSync(TEMP_CONFIG)) fs.unlinkSync(TEMP_CONFIG);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (fs.existsSync(TEMP_CONFIG)) fs.unlinkSync(TEMP_CONFIG);
    vi.restoreAllMocks();
  });

  it('set and show roundtrip', () => {
    handleConfigCommand('set', { key: 'since', value: '3 days ago' });
    const config = loadConfig();
    expect(config.since).toBe('3 days ago');
  });

  it('reset clears saved config', () => {
    handleConfigCommand('set', { key: 'since', value: '5 days ago' });
    handleConfigCommand('reset', {});
    const config = loadConfig();
    expect(config.since).toBe('1 day ago');
  });

  it('set parses JSON arrays', () => {
    handleConfigCommand('set', { key: 'repos', value: '["/a","/b"]' });
    const config = loadConfig();
    expect(config.repos).toEqual(['/a', '/b']);
  });
});
