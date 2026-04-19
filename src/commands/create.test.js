import { jest } from '@jest/globals';

const mockScaffold = jest.fn();
const mockTemplateExists = jest.fn();
const mockLoadTemplateMeta = jest.fn();

jest.unstable_mockModule('../scaffold.js', () => ({
  scaffoldProject: mockScaffold,
}));

jest.unstable_mockModule('../templates.js', () => ({
  templateExists: mockTemplateExists,
  loadTemplateMeta: mockLoadTemplateMeta,
}));

const { handler } = await import('./create.js');

describe('create command handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls scaffoldProject with correct args', async () => {
    mockTemplateExists.mockReturnValue(true);
    mockLoadTemplateMeta.mockReturnValue({ name: 'node-basic', description: 'Basic node' });
    mockScaffold.mockResolvedValue();

    await handler({ template: 'node-basic', name: 'my-app', output: '.' });

    expect(mockScaffold).toHaveBeenCalledWith(
      expect.objectContaining({ template: 'node-basic', name: 'my-app' })
    );
  });

  it('throws if template does not exist', async () => {
    mockTemplateExists.mockReturnValue(false);

    await expect(
      handler({ template: 'nonexistent', name: 'my-app', output: '.' })
    ).rejects.toThrow(/template/i);
  });

  it('uses cwd as default output', async () => {
    mockTemplateExists.mockReturnValue(true);
    mockLoadTemplateMeta.mockReturnValue({ name: 'node-basic' });
    mockScaffold.mockResolvedValue();

    await handler({ template: 'node-basic', name: 'proj' });

    expect(mockScaffold).toHaveBeenCalledWith(
      expect.objectContaining({ output: process.cwd() })
    );
  });
});
