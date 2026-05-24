// Annotates commits with extra metadata: labels, flags, and context

const BREAKING_PATTERNS = [/breaking change/i, /!:/, /BREAKING/];
const HOTFIX_PATTERNS = [/hotfix/i, /urgent/i, /critical/i];
const WIP_PATTERNS = [/^wip/i, /work in progress/i, /\[wip\]/i];

function isBreakingChange(commit) {
  return BREAKING_PATTERNS.some(p => p.test(commit.message));
}

function isHotfix(commit) {
  return HOTFIX_PATTERNS.some(p => p.test(commit.message));
}

function isWip(commit) {
  return WIP_PATTERNS.some(p => p.test(commit.message));
}

function isFirstCommitOfDay(commit, allCommits) {
  const day = commit.date.slice(0, 10);
  const sameDay = allCommits.filter(c => c.date.slice(0, 10) === day);
  const sorted = [...sameDay].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[0] && sorted[0].hash === commit.hash;
}

function buildAnnotations(commit, allCommits) {
  const flags = [];
  if (isBreakingChange(commit)) flags.push('breaking');
  if (isHotfix(commit)) flags.push('hotfix');
  if (isWip(commit)) flags.push('wip');
  if (isFirstCommitOfDay(commit, allCommits)) flags.push('first-of-day');
  return flags;
}

function annotateCommits(commits) {
  return commits.map(commit => ({
    ...commit,
    annotations: buildAnnotations(commit, commits),
  }));
}

module.exports = {
  isBreakingChange,
  isHotfix,
  isWip,
  isFirstCommitOfDay,
  buildAnnotations,
  annotateCommits,
};
