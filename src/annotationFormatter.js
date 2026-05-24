// Formats annotation flags into human-readable labels for digest output

const ANNOTATION_LABELS = {
  breaking: '🚨 BREAKING',
  hotfix: '🔥 HOTFIX',
  wip: '🚧 WIP',
  'first-of-day': '🌅 First commit',
};

const ANNOTATION_COLORS = {
  breaking: '\x1b[31m',
  hotfix: '\x1b[33m',
  wip: '\x1b[36m',
  'first-of-day': '\x1b[32m',
};

const RESET = '\x1b[0m';

function formatAnnotationBadge(flag, { color = false } = {}) {
  const label = ANNOTATION_LABELS[flag] || flag;
  if (!color) return `[${label}]`;
  const c = ANNOTATION_COLORS[flag] || '';
  return `${c}[${label}]${RESET}`;
}

function formatAnnotations(annotations, opts = {}) {
  if (!annotations || annotations.length === 0) return '';
  return annotations.map(f => formatAnnotationBadge(f, opts)).join(' ');
}

function appendAnnotations(line, annotations, opts = {}) {
  const badges = formatAnnotations(annotations, opts);
  if (!badges) return line;
  return `${line} ${badges}`;
}

module.exports = {
  formatAnnotationBadge,
  formatAnnotations,
  appendAnnotations,
  ANNOTATION_LABELS,
};
