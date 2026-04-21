const { handler } = require('./lint-all');
const { listTemplates } = require('../templates');
const { lintTemplate } = require('./lint');

jest.mock('../templates');
jest.mock('./lint');

describe('lint-all handler', () => {
  let consoleSpy, errorSpy, warnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.exitCode = 0;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('prints message when no templates exist', () => {
    listTemplates.mockReturnValue([]);
    handler({ strict: false });
    expect(consoleSpy).toHaveBeenCalledWith('No templates found.');
  });

  it('reports all clear when no issues found', () => {
    listTemplates.mockReturnValue(['tpl-a', 'tpl-b']);
    lintTemplate.mockReturnValue({ errors: [], warnings: [] });
    handler({ strict: false });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('All templates passed'));
    expect(process.exitCode).toBe(0);
  });

  it('sets exitCode 1 when errors exist', () => {
    listTemplates.mockReturnValue(['bad-tpl']);
    lintTemplate.mockReturnValue({ errors: ['Missing field'], warnings: [] });
    handler({ strict: false });
    expect(process.exitCode).toBe(1);
  });

  it('sets exitCode 1 for warnings in strict mode', () => {
    listTemplates.mockReturnValue(['warn-tpl']);
    lintTemplate.mockReturnValue({ errors: [], warnings: ['Unknown field'] });
    handler({ strict: true });
    expect(process.exitCode).toBe(1);
  });

  it('does not set exitCode 1 for warnings in non-strict mode', () => {
    listTemplates.mockReturnValue(['warn-tpl']);
    lintTemplate.mockReturnValue({ errors: [], warnings: ['Unknown field'] });
    handler({ strict: false });
    expect(process.exitCode).toBe(0);
  });

  it('calls lintTemplate for each template', () => {
    listTemplates.mockReturnValue(['a', 'b', 'c']);
    lintTemplate.mockReturnValue({ errors: [], warnings: [] });
    handler({ strict: false });
    expect(lintTemplate).toHaveBeenCalledTimes(3);
  });
});
