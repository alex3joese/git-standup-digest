import os from 'os';
import path from 'path';
import fs from 'fs';

const CONFIG_FILE = path.join(os.homedir(), '.git-standup-digest.json');

const DEFAULTS = {
  author: null,
  since: '1 day ago',
  repos: [],
  format: 'text',
  excludePatterns: ['Merge branch', 'Merge pull request'],
  maxCommitsPerRepo: 20,
};

export function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { ...DEFAULTS };
  }

  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    const userConfig = JSON.parse(raw);
    return { ...DEFAULTS, ...userConfig };
  } catch (err) {
    console.warn(`Warning: could not parse config file at ${CONFIG_FILE}`);
    return { ...DEFAULTS };
  }
}

export function saveConfig(config) {
  const merged = { ...loadConfig(), ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf8');
}

export function getConfigPath() {
  return CONFIG_FILE;
}

export function resetConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
}

export { DEFAULTS };
