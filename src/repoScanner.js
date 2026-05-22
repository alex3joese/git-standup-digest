const fs = require('fs');
const path = require('path');

/**
 * Check if a directory contains a .git folder (is a git repo)
 * @param {string} dir
 * @returns {boolean}
 */
function isGitRepo(dir) {
  try {
    return fs.statSync(path.join(dir, '.git')).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Scan a base directory for immediate subdirectories that are git repos.
 * Also includes the base directory itself if it's a repo.
 * @param {string} baseDir - absolute path to scan
 * @returns {string[]} list of absolute repo paths
 */
function scanForRepos(baseDir) {
  const repos = [];

  if (!fs.existsSync(baseDir)) {
    return repos;
  }

  if (isGitRepo(baseDir)) {
    repos.push(path.resolve(baseDir));
  }

  let entries;
  try {
    entries = fs.readdirSync(baseDir, { withFileTypes: true });
  } catch {
    return repos;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(baseDir, entry.name);
    if (isGitRepo(fullPath)) {
      repos.push(path.resolve(fullPath));
    }
  }

  return repos;
}

/**
 * Resolve a list of repo paths from config dirs + explicit paths.
 * Deduplicates results.
 * @param {string[]} dirs - directories to scan
 * @param {string[]} explicit - explicit repo paths
 * @returns {string[]}
 */
function resolveRepoPaths(dirs = [], explicit = []) {
  const seen = new Set();
  const result = [];

  for (const dir of dirs) {
    for (const repo of scanForRepos(dir)) {
      if (!seen.has(repo)) {
        seen.add(repo);
        result.push(repo);
      }
    }
  }

  for (const repo of explicit) {
    const resolved = path.resolve(repo);
    if (!seen.has(resolved)) {
      seen.add(resolved);
      result.push(resolved);
    }
  }

  return result;
}

module.exports = { isGitRepo, scanForRepos, resolveRepoPaths };
