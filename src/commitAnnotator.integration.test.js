// Integration: annotateCommits + appendAnnotations work end-to-end
const { annotateCommits } = require('./commitAnnotator');
const { appendAnnotations } = require('./annotationFormatter');
const { formatCommitLine } = require('./formatDigest');

function makeCommit(overrides) {
  return {
    hash: 'deadbeef',
    date: '2024-03-01T08:30:00',
    author: 'Alice',
    message: 'fix: something',
    repo: 'my-app',
    ...overrides,
  };
}

describe('commitAnnotator + annotationFormatter integration', () => {
  it('annotates and formats a breaking commit', () => {
    const commits = [makeCommit({ message: 'feat!: remove legacy endpoint', hash: 'h1' })];
    const annotated = annotateCommits(commits);
    const line = formatCommitLine(annotated[0]);
    const output = appendAnnotations(line, annotated[0].annotations);
    expect(output).toContain('remove legacy endpoint');
    expect(output).toContain('[🚨 BREAKING]');
  });

  it('annotates and formats a hotfix commit', () => {
    const commits = [makeCommit({ message: 'hotfix: null ref crash', hash: 'h2' })];
    const annotated = annotateCommits(commits);
    const line = formatCommitLine(annotated[0]);
    const output = appendAnnotations(line, annotated[0].annotations);
    expect(output).toContain('[🔥 HOTFIX]');
  });

  it('first commit of day gets first-of-day annotation', () => {
    const commits = [
      makeCommit({ hash: 'h3', date: '2024-03-01T07:00:00', message: 'chore: morning task' }),
      makeCommit({ hash: 'h4', date: '2024-03-01T12:00:00', message: 'feat: afternoon work' }),
    ];
    const annotated = annotateCommits(commits);
    expect(annotated[0].annotations).toContain('first-of-day');
    expect(annotated[1].annotations).not.toContain('first-of-day');
  });

  it('plain commit gets no annotations', () => {
    const commits = [makeCommit({ message: 'docs: update readme', hash: 'h5' })];
    const annotated = annotateCommits(commits);
    expect(annotated[0].annotations).toHaveLength(0);
    const line = formatCommitLine(annotated[0]);
    const output = appendAnnotations(line, annotated[0].annotations);
    expect(output).not.toContain('[');
  });
});
