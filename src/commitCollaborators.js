// Analyzes commits to surface co-author and collaborator information

/**
 * Extracts Co-authored-by trailers from a commit message.
 * @param {string} message
 * @returns {string[]}
 */
function extractCoAuthors(message) {
  if (!message) return [];
  const pattern = /Co-authored-by:\s*([^<]+)<[^>]+>/gi;
  const authors = [];
  let match;
  while ((match = pattern.exec(message)) !== null) {
    const name = match[1].trim();
    if (name) authors.push(name);
  }
  return authors;
}

/**
 * Builds a map of author -> set of collaborators they've co-committed with.
 * @param {object[]} commits
 * @returns {Map<string, Set<string>>}
 */
function buildCollaboratorMap(commits) {
  const map = new Map();
  for (const commit of commits) {
    const primary = commit.author;
    const coAuthors = extractCoAuthors(commit.message || '');
    if (!map.has(primary)) map.set(primary, new Set());
    for (const co of coAuthors) {
      map.get(primary).add(co);
      if (!map.has(co)) map.set(co, new Set());
      map.get(co).add(primary);
    }
  }
  return map;
}

/**
 * Counts how many unique collaborators each author has.
 * @param {Map<string, Set<string>>} collaboratorMap
 * @returns {object[]}
 */
function rankByCollaborators(collaboratorMap) {
  return Array.from(collaboratorMap.entries())
    .map(([author, collabs]) => ({ author, count: collabs.size, collaborators: Array.from(collabs) }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Formats a collaborator report as a string.
 * @param {object[]} ranked
 * @returns {string}
 */
function formatCollaboratorReport(ranked) {
  if (!ranked.length) return 'No collaborator data found.';
  const lines = ['👥 Collaborator Summary', ''];
  for (const { author, count, collaborators } of ranked) {
    if (count === 0) continue;
    lines.push(`  ${author} — ${count} collaborator(s): ${collaborators.join(', ')}`);
  }
  return lines.join('\n');
}

module.exports = {
  extractCoAuthors,
  buildCollaboratorMap,
  rankByCollaborators,
  formatCollaboratorReport,
};
