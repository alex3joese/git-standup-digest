const { buildSubjectList, formatSubjectDigest, annotateWithSubjects } = require('./commitFirstLines');

/**
 * Prints the header for the first-lines digest command.
 * @param {number} count
 */
function printFirstLinesHeader(count) {
  console.log(`\n📋 Commit Subject Digest (${count} unique subject${count !== 1 ? 's' : ''})`);
  console.log('─'.repeat(50));
}

/**
 * Handles the `first-lines` CLI command.
 * Prints a numbered digest of unique commit subjects.
 *
 * @param {object[]} commits - raw commit objects with `message` field
 * @param {object} options
 * @param {boolean} [options.annotate] - if true, also returns annotated commits
 * @param {boolean} [options.quiet] - suppress header
 * @returns {{ subjects: string[], annotated: object[] }}
 */
function handleFirstLinesCommand(commits, options = {}) {
  const { annotate = false, quiet = false } = options;

  const subjects = buildSubjectList(commits);

  if (!quiet) {
    printFirstLinesHeader(subjects.length);
  }

  const digest = formatSubjectDigest(subjects);
  console.log(digest);

  const annotated = annotate ? annotateWithSubjects(commits) : [];

  return { subjects, annotated };
}

module.exports = {
  printFirstLinesHeader,
  handleFirstLinesCommand
};
