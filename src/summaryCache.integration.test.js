import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const TMP_DIR = path.join(os.tmpdir(), 'gsd-cache-integration-' + Date.now());

// Override cache dir before importing module
process.env.GSD_CACHE_DIR = TMP_DIR;

import { writeCache, readCache, clearCache, isCacheValid } from './summaryCache.js';

describe('summaryCache integration', () => {
  const dateKey = '2024-06-15';
  const payload = {
    repos: ['my-app', 'api-service'],
    totalCommits: 8,
    generatedAt: new Date().toISOString(),
  };

  beforeAll(() => {
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(TMP_DIR)) {
      fs.readdirSync(TMP_DIR).forEach(f => fs.unlinkSync(path.join(TMP_DIR, f)));
      fs.rmdirSync(TMP_DIR);
    }
  });

  it('full write → read → validate → clear lifecycle', () => {
    writeCache(dateKey, payload);

    const cached = readCache(dateKey);
    expect(cached).toEqual(payload);

    const valid = isCacheValid(dateKey, 60);
    expect(valid).toBe(true);

    const cleared = clearCache(dateKey);
    expect(cleared).toBe(true);

    const afterClear = readCache(dateKey);
    expect(afterClear).toBeNull();
  });

  it('clearCache with no arg clears all files', () => {
    writeCache('2024-06-13', { a: 1 });
    writeCache('2024-06-14', { b: 2 });
    const count = clearCache();
    expect(count).toBeGreaterThanOrEqual(2);
    expect(readCache('2024-06-13')).toBeNull();
    expect(readCache('2024-06-14')).toBeNull();
  });
});
