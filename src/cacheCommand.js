import { readCache, clearCache, isCacheValid, getCachePath, getCacheDir } from './summaryCache.js';
import fs from 'fs';
import path from 'path';

export function handleCacheCommand(subcommand, args = {}) {
  switch (subcommand) {
    case 'show':
      return showCache(args.date);
    case 'clear':
      return clearCacheCommand(args.date);
    case 'status':
      return cacheStatus(args.date);
    case 'path':
      console.log(getCacheDir());
      return;
    default:
      console.error(`Unknown cache subcommand: ${subcommand}`);
      console.error('Available: show, clear, status, path');
      process.exit(1);
  }
}

export function showCache(dateKey) {
  if (!dateKey) {
    console.error('Usage: git-standup cache show <date>');
    process.exit(1);
  }
  const cached = readCache(dateKey);
  if (!cached) {
    console.log(`No cache found for ${dateKey}`);
    return;
  }
  console.log(JSON.stringify(cached, null, 2));
}

export function clearCacheCommand(dateKey) {
  if (dateKey) {
    const removed = clearCache(dateKey);
    if (removed) {
      console.log(`Cache cleared for ${dateKey}`);
    } else {
      console.log(`No cache found for ${dateKey}`);
    }
  } else {
    const count = clearCache();
    console.log(`Cleared ${count} cache file(s)`);
  }
}

export function cacheStatus(dateKey) {
  if (!dateKey) {
    const dir = getCacheDir();
    if (!fs.existsSync(dir)) {
      console.log('Cache directory does not exist.');
      return;
    }
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    console.log(`Cache directory: ${dir}`);
    console.log(`Cached entries: ${files.length}`);
    files.forEach(f => {
      const key = path.basename(f, '.json');
      const valid = isCacheValid(key, 60);
      console.log(`  ${key}: ${valid ? 'fresh' : 'stale'}`);
    });
    return;
  }
  const valid = isCacheValid(dateKey, 60);
  const cached = readCache(dateKey);
  if (!cached) {
    console.log(`No cache for ${dateKey}`);
  } else {
    console.log(`Cache for ${dateKey}: ${valid ? 'fresh' : 'stale'}`);
  }
}
