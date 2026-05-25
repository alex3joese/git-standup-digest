// Extracts and summarizes the first line of each commit message
// Useful for building quick-scan digest views

/**
 * Returns the first line of a commit message (subject only).
 * @param {string} message
 * @returns {string}
 */
function extractSubject(message) {
  if (!message) return '';
  return message.split('\n')[0].trim();
}

/**
 * Truncates a subject line to a max length, appending ellipsis if needed.
 * @param {string} subject
 * @param {number} maxLen
 * @returns {string}
 */
function truncateSubject(subject, maxLen = 72) {
  if (subject.length <= maxLen) return subject;
  return subject.slice(0, maxLen - 1) + '…';
}

/**
 * Annotates each commit with a `subject` field.
 * @param {object[]} commits
 * @returns {object[]}
 */
function annotateWithSubjects(commits) {
  return commits.map(commit => ({
    ...commit,
    subject: extractSubject(commit.message)
  }));
}

/**
 * Builds a flat list of unique subject lines across all commits.
 * @param {object[]} commits
 * @returns {string[]}
 */
function buildSubjectList(commits) {
  const seen = new Set();
  const subjects = [];
  for (const commit of commits) {
    const subject = extractSubject(commit.message);
    if (subject && !seen.has(subject)) {
      seen.add(subject);
      subjects.push(subject);
    }
  }
  return subjects;
}

/**
 * Formats a subject list as a numbered digest string.
 * @param {string[]} subjects
 * @returns {string}
 */
function formatSubjectDigest(subjects) {
  if (!subjects.length) return '(no commits)';
  return subjects
    .map((s, i) => `  ${i + 1}. ${truncateSubject(s)}`)
    .join('\n');
}

module.exports = {
  extractSubject,
  truncateSubject,
  annotateWithSubjects,
  buildSubjectList,
  formatSubjectDigest
};
