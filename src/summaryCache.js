import fs from 'fs';
import path from 'path';
import os from 'os';

const CACHE_DIR = path.join(os.homedir(), '.git-standup-digest', 'cache');

export function getCacheDir() {
  return CACHE_DIR;
}

export function getCachePath(dateKey) {
  return path.join(CACHE_DIR, `${dateKey}.json`);
}

export function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function readCache(dateKey) {
  const cachePath = getCachePath(dateKey);
  if (!fs.existsSync(cachePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(cachePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeCache(dateKey, data) {
  ensureCacheDir();
  const cachePath = getCachePath(dateKey);
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf8');
}

export function clearCache(dateKey) {
  if (dateKey) {
    const cachePath = getCachePath(dateKey);
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
      return true;
    }
    return false;
  }
  if (fs.existsSync(CACHE_DIR)) {
    const files = fs.readdirSync(CACHE_DIR);
    files.forEach(f => fs.unlinkSync(path.join(CACHE_DIR, f)));
    return files.length;
  }
  return 0;
}

export function isCacheValid(dateKey, maxAgeMinutes = 60) {
  const cachePath = getCachePath(dateKey);
  if (!fs.existsSync(cachePath)) return false;
  const stat = fs.statSync(cachePath);
  const ageMs = Date.now() - stat.mtimeMs;
  return ageMs < maxAgeMinutes * 60 * 1000;
}
