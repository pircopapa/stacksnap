import { jest } from '@jest/globals';

const mockTemplateExists = jest.fn();
const mockLoadTemplateMeta = jest.fn();
const mockGetTemplatePath = jest.fn();
const mockExistsSync = jest.fn();
const mockReaddirSync = jest.fn();

jest.unstable_mockModule('../templates.js', () => ({
  templateExists: mockTemplateExists,
  loadTemplateMeta: mockLoadTemplateMeta,
  getTemplatePath: mockGetTemplatePath,
}));

jest.unstable_mockModule('fs', () => ({
  default: { existsSync: mockExistsSync, readdirSync: mockReaddirSync },
}));

const { handler } = await import('./validate.js');

describe('validate command handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.exitCode = 0;
  });

  it('throws if template does not exist', async () => {
    mockTemplateExists.mockReturnValue(false);
    await expect(handler({ template: 'ghost' })).rejects.toThrow(/not found/i);
  });

  it('sets exitCode on missing meta fields', async () => {
    mockTemplateExists.mockReturnValue(true);
    mockLoadTemplateMeta.mockReturnValue({ name: 'foo' });
    mockGetTemplatePath.mockReturnValue('/templates/foo');
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['index.js']);

    await handler({ template: 'foo' });

    expect(process.exitCode).toBe(1);
  });

  it('passes validation for complete template', async () => {
    mockTemplateExists.mockReturnValue(true);
    mockLoadTemplateMeta.mockReturnValue({
      name: 'node-basic',
      description: 'A basic node template',
      version: '1.0.0',
    });
    mockGetTemplatePath.mockReturnValue('/templates/node-basic');
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['index.js', 'package.json']);

    await handler({ template: 'node-basic' });

    expect(process.exitCode).not.toBe(1);
  });
});
