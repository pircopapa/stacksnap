const { lintTemplate } = require('./lint');
const { templateExists, loadTemplateMeta, getTemplatePath } = require('../templates');
const fs = require('fs');

jest.mock('../templates');
jest.mock('fs');

describe('lintTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    templateExists.mockReturnValue(true);
    getTemplatePath.mockReturnValue('/templates/my-tpl');
    fs.readdirSync.mockReturnValue(['index.js', 'meta.json']);
  });

  it('returns error if template does not exist', () => {
    templateExists.mockReturnValue(false);
    const { errors } = lintTemplate('missing');
    expect(errors).toContain('Template "missing" does not exist.');
  });

  it('returns error if meta.json cannot be parsed', () => {
    loadTemplateMeta.mockImplementation(() => { throw new Error('bad json'); });
    const { errors } = lintTemplate('broken');
    expect(errors[0]).toMatch('Failed to parse meta.json');
  });

  it('returns error for missing required fields', () => {
    loadTemplateMeta.mockReturnValue({ name: 'tpl' });
    const { errors } = lintTemplate('tpl');
    expect(errors).toContain('Missing required field: "description"');
  });

  it('returns warning for unknown meta fields', () => {
    loadTemplateMeta.mockReturnValue({ name: 'tpl', description: 'desc', foo: 'bar' });
    const { warnings } = lintTemplate('tpl');
    expect(warnings).toContain('Unknown meta field: "foo"');
  });

  it('warns if version is not semver', () => {
    loadTemplateMeta.mockReturnValue({ name: 'tpl', description: 'desc', version: 'v1' });
    const { warnings } = lintTemplate('tpl');
    expect(warnings[0]).toMatch('semver');
  });

  it('returns error if tags is not an array', () => {
    loadTemplateMeta.mockReturnValue({ name: 'tpl', description: 'desc', tags: 'node' });
    const { errors } = lintTemplate('tpl');
    expect(errors).toContain('Field "tags" must be an array.');
  });

  it('warns if template has no files', () => {
    loadTemplateMeta.mockReturnValue({ name: 'tpl', description: 'desc' });
    fs.readdirSync.mockReturnValue(['meta.json']);
    const { warnings } = lintTemplate('tpl');
    expect(warnings[0]).toMatch('no files');
  });

  it('returns no issues for a clean template', () => {
    loadTemplateMeta.mockReturnValue({ name: 'tpl', description: 'A template', version: '1.0.0', tags: ['node'] });
    const { warnings, errors } = lintTemplate('tpl');
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
