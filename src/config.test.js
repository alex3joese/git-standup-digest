import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import { loadConfig, saveConfig, resetConfig, getConfigPath, DEFAULTS } from './config.js';

vi.mock('fs');

describe('config', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('loadConfig', () => {
    it('returns defaults when config file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const config = loadConfig();
      expect(config).toEqual(DEFAULTS);
    });

    it('merges user config with defaults', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ author: 'jane', since: '2 days ago' }));
      const config = loadConfig();
      expect(config.author).toBe('jane');
      expect(config.since).toBe('2 days ago');
      expect(config.format).toBe('text');
    });

    it('returns defaults on malformed JSON', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('not-json');
      const config = loadConfig();
      expect(config).toEqual(DEFAULTS);
    });
  });

  describe('saveConfig', () => {
    it('writes merged config to disk', () => {
      fs.existsSync.mockReturnValue(false);
      saveConfig({ author: 'bob' });
      expect(fs.writeFileSync).toHaveBeenCalled();
      const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
      expect(written.author).toBe('bob');
    });
  });

  describe('resetConfig', () => {
    it('deletes the config file if it exists', () => {
      fs.existsSync.mockReturnValue(true);
      resetConfig();
      expect(fs.unlinkSync).toHaveBeenCalledWith(getConfigPath());
    });

    it('does nothing if config file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      resetConfig();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
