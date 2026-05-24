const {
  formatAnnotationBadge,
  formatAnnotations,
  appendAnnotations,
  ANNOTATION_LABELS,
} = require('./annotationFormatter');

describe('formatAnnotationBadge', () => {
  it('returns a bracketed label for known flag', () => {
    expect(formatAnnotationBadge('hotfix')).toBe('[🔥 HOTFIX]');
  });
  it('returns a bracketed label for breaking', () => {
    expect(formatAnnotationBadge('breaking')).toBe('[🚨 BREAKING]');
  });
  it('falls back to raw flag for unknown annotation', () => {
    expect(formatAnnotationBadge('custom-flag')).toBe('[custom-flag]');
  });
  it('includes ANSI color codes when color option is true', () => {
    const result = formatAnnotationBadge('hotfix', { color: true });
    expect(result).toContain('\x1b[');
    expect(result).toContain('🔥 HOTFIX');
  });
});

describe('formatAnnotations', () => {
  it('returns empty string for empty array', () => {
    expect(formatAnnotations([])).toBe('');
  });
  it('returns empty string for undefined', () => {
    expect(formatAnnotations(undefined)).toBe('');
  });
  it('joins multiple badges with space', () => {
    const result = formatAnnotations(['breaking', 'hotfix']);
    expect(result).toBe('[🚨 BREAKING] [🔥 HOTFIX]');
  });
});

describe('appendAnnotations', () => {
  it('appends badges to a commit line', () => {
    const result = appendAnnotations('- fix: crash', ['hotfix']);
    expect(result).toBe('- fix: crash [🔥 HOTFIX]');
  });
  it('returns original line if no annotations', () => {
    expect(appendAnnotations('- chore: cleanup', [])).toBe('- chore: cleanup');
  });
  it('appends multiple badges', () => {
    const result = appendAnnotations('- feat!: drop api', ['breaking', 'first-of-day']);
    expect(result).toContain('[🚨 BREAKING]');
    expect(result).toContain('[🌅 First commit]');
  });
});

describe('ANNOTATION_LABELS', () => {
  it('has entries for all core flags', () => {
    expect(ANNOTATION_LABELS).toHaveProperty('breaking');
    expect(ANNOTATION_LABELS).toHaveProperty('hotfix');
    expect(ANNOTATION_LABELS).toHaveProperty('wip');
    expect(ANNOTATION_LABELS).toHaveProperty('first-of-day');
  });
});
