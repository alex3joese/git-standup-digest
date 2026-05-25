// Analyzes the scope/area of changes based on conventional commit format and file paths

function extractScope(message) {
  const match = message.match(/^\w+\(([^)]+)\)/);
  return match ? match[1].toLowerCase() : null;
}

function inferScopeFromFiles(files = []) {
  if (!files.length) return null;
  const dirs = files
    .map(f => f.split('/').slice(0, -1).join('/'))
    .filter(Boolean);
  if (!dirs.length) return null;
  const freq = {};
  for (const d of dirs) freq[d] = (freq[d] || 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

function resolveScope(commit) {
  return extractScope(commit.message) || inferScopeFromFiles(commit.files) || 'general';
}

function annotateCommitsWithScope(commits) {
  return commits.map(c => ({ ...c, scope: resolveScope(c) }));
}

function groupByScope(commits) {
  const annotated = annotateCommitsWithScope(commits);
  const groups = {};
  for (const c of annotated) {
    if (!groups[c.scope]) groups[c.scope] = [];
    groups[c.scope].push(c);
  }
  return groups;
}

function buildScopeSummary(commits) {
  const groups = groupByScope(commits);
  return Object.entries(groups)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([scope, list]) => ({
      scope,
      count: list.length,
      repos: [...new Set(list.map(c => c.repo).filter(Boolean))],
    }));
}

module.exports = {
  extractScope,
  inferScopeFromFiles,
  resolveScope,
  annotateCommitsWithScope,
  groupByScope,
  buildScopeSummary,
};
