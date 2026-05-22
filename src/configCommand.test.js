import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleConfigCommand } from './configCommand.js';
import * as configModule from './config.js';

vi.mock('./config.js');

describe('handleConfigCommand', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configModule.DEFAULTS = { author: null, since: '1 day ago', format: 'text' };
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('show prints current config', () => {
    configModule.loadConfig.mockReturnValue({ author: 'alice', since: '1 day ago' });
    handleConfigCommand('show', {});
    expect(console.log).toHaveBeenCalledWith('Current configuration:');
  });

  it('set saves a valid key', () => {
    configModule.loadConfig.mockReturnValue({});
    configModule.DEFAULTS = { author: null, since: '1 day ago', format: 'text' };
    handleConfigCommand('set', { key: 'author', value: 'alice' });
    expect(configModule.saveConfig).toHaveBeenCalledWith({ author: 'alice' });
  });

  it('set exits on unknown key', () => {
    configModule.DEFAULTS = { author: null };
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => handleConfigCommand('set', { key: 'unknown', value: 'x' })).toThrow('exit');
    exitSpy.mockRestore();
  });

  it('reset calls resetConfig', () => {
    handleConfigCommand('reset', {});
    expect(configModule.resetConfig).toHaveBeenCalled();
  });

  it('path prints config file path', () => {
    configModule.getConfigPath.mockReturnValue('/home/user/.git-standup-digest.json');
    handleConfigCommand('path', {});
    expect(console.log).toHaveBeenCalledWith('/home/user/.git-standup-digest.json');
  });

  it('unknown subcommand shows help', () => {
    handleConfigCommand('invalid', {});
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });
});
