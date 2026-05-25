/**
 * commitRefSummary.js
 * Summarizes commits that reference issues, PRs, or tickets (e.g. #123, JIRA-456)
 */

const ISSUE_PATTERN = /#(\d+)/g;
const TICKET_PATTERN = /\b([A-Z]{2,10}-\d+)\b/g;

/**
 * Extract all issue/PR references from a commit message.
 * @param {string} message
 * @returns {string[]}
 */
function extractRefs(message) {
  const refs = [];
  let match;
  while ((match = ISSUE_PATTERN.exec(message)) !== null) {
    refs.push(`#${match[1]}`);
  }
  ISSUE_PATTERN.lastIndex = 0;
  while ((match = TICKET_PATTERN.exec(message)) !== null) {
    refs.push(match[1]);
  }
  TICKET_PATTERN.lastIndex = 0;
  return [...new Set(refs)];
}

/**
 * Annotate each commit with its extracted refs.
 * @param {object[]} commits
 * @returns {object[]}
 */
function annotateCommitsWithRefs(commits) {
  return commits.map(commit => ({
    ...commit,
    refs: extractRefs(commit.message || ''),
  }));
}

/**
 * Build a summary mapping each ref to the commits that mention it.
 * @param {object[]} commits - already annotated with refs
 * @returns {object} { ref: commit[] }
 */
function buildRefSummary(commits) {
  const summary = {};
  for (const commit of commits) {
    for (const ref of commit.refs || []) {
      if (!summary[ref]) summary[ref] = [];
      summary[ref].push(commit);
    }
  }
  return summary;
}

/**
 * Format the ref summary as a readable string.
 * @param {object} refSummary
 * @returns {string}
 */
function formatRefSummary(refSummary) {
  const refs = Object.keys(refSummary).sort();
  if (refs.length === 0) return 'No issue or ticket references found.';
  return refs
    .map(ref => {
      const commits = refSummary[ref];
      const lines = commits.map(c => `  - [${c.repo || 'unknown'}] ${c.message}`).join('\n');
      return `${ref} (${commits.length} commit${commits.length > 1 ? 's' : ''}):\n${lines}`;
    })
    .join('\n\n');
}

module.exports = { extractRefs, annotateCommitsWithRefs, buildRefSummary, formatRefSummary };
