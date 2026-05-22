const { renderTemplate, isValidTemplate, VALID_TEMPLATES } = require('./templateRenderer');

const sampleDigest = {
  date: '2024-06-10',
  repos: [
    {
      repo: 'my-app',
      commits: ['abc1234 fix login bug', 'def5678 update deps'],
    },
    {
      repo: 'api-service',
      commits: ['aaa0001 add health endpoint'],
    },
  ],
};

describe('isValidTemplate', () => {
  test('returns true for default', () => {
    expect(isValidTemplate('default')).toBe(true);
  });

  test('returns true for markdown', () => {
    expect(isValidTemplate('markdown')).toBe(true);
  });

  test('returns true for slack', () => {
    expect(isValidTemplate('slack')).toBe(true);
  });

  test('returns false for unknown template', () => {
    expect(isValidTemplate('html')).toBe(false);
  });
});

describe('VALID_TEMPLATES', () => {
  test('includes default, markdown, slack', () => {
    expect(VALID_TEMPLATES).toEqual(expect.arrayContaining(['default', 'markdown', 'slack']));
  });
});

describe('renderTemplate', () => {
  test('default template includes repo name in brackets', () => {
    const output = renderTemplate(sampleDigest, 'default');
    expect(output).toContain('[my-app]');
    expect(output).toContain('[api-service]');
  });

  test('default template indents commit lines', () => {
    const output = renderTemplate(sampleDigest, 'default');
    expect(output).toContain('  abc1234 fix login bug');
  });

  test('markdown template uses ## for repo headers', () => {
    const output = renderTemplate(sampleDigest, 'markdown');
    expect(output).toContain('## my-app');
  });

  test('markdown template uses - for commit lines', () => {
    const output = renderTemplate(sampleDigest, 'markdown');
    expect(output).toContain('- abc1234 fix login bug');
  });

  test('slack template bolds repo names', () => {
    const output = renderTemplate(sampleDigest, 'slack');
    expect(output).toContain('*my-app*');
  });

  test('slack template uses bullet for commits', () => {
    const output = renderTemplate(sampleDigest, 'slack');
    expect(output).toContain('  • add health endpoint');
  });

  test('falls back to default for unknown template name', () => {
    const output = renderTemplate(sampleDigest, 'unknown');
    expect(output).toContain('[my-app]');
  });

  test('includes the date in the header', () => {
    const output = renderTemplate(sampleDigest, 'markdown');
    expect(output).toContain('2024-06-10');
  });
});
