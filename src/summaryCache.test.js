import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getCachePath,
  readCache,
  writeCache,
  clearCache,
  isCacheValid,
  getCacheDir,
} from './summaryCache.js';

const TMP_CACHE = path.join(os.tmpdir(), 'gsd-cache-test-' + Date.now());

vi.mock('./summaryCache.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getCacheDir: () => TMP_CACHE,
    getCachePath: (dateKey) => path.join(TMP_CACHE, `${dateKey}.json`),
  };
});

describe('summaryCache', () => {
  beforeEach(() => {
    if (!fs.existsSync(TMP_CACHE)) fs.mkdirSync(TMP_CACHE, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TMP_CACHE)) {
      fs.readdirSync(TMP_CACHE).forEach(f => fs.unlinkSync(path.join(TMP_CACHE, f)));
    }
  });

  it('returns null when cache file does not exist', () => {
    const result = readCache('2024-01-01');
    expect(result).toBeNull();
  });

  it('writes and reads cache correctly', () => {
    const data = { repos: ['repo-a'], commits: 5 };
    writeCache('2024-01-01', data);
    const result = readCache('2024-01-01');
    expect(result).toEqual(data);
  });

  it('clearCache removes a specific date file', () => {
    writeCache('2024-01-02', { test: true });
    const removed = clearCache('2024-01-02');
    expect(removed).toBe(true);
    expect(readCache('2024-01-02')).toBeNull();
  });

  it('clearCache returns false if file not found', () => {
    const removed = clearCache('9999-99-99');
    expect(removed).toBe(false);
  });

  it('isCacheValid returns false when file missing', () => {
    expect(isCacheValid('2024-01-01')).toBe(false);
  });

  it('isCacheValid returns true for fresh cache', () => {
    writeCache('2024-01-03', { ok: true });
    expect(isCacheValid('2024-01-03', 60)).toBe(true);
  });

  it('isCacheValid returns false for expired cache', () => {
    writeCache('2024-01-04', { ok: true });
    expect(isCacheValid('2024-01-04', 0)).toBe(false);
  });
});
