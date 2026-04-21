const fs = require('fs');
const path = require('path');
const { isLocked, getLockfilePath, handler } = require('./lock');

jest.mock('../config', () => ({
  getTemplatesDir: () => '/mock/templates',
}));

jest.mock('../templates', () => ({
  templateExists: jest.fn(),
}));

const { templateExists } = require('../templates');

jest.mock('fs');

describe('lock command', () => {
  const templatesDir = '/mock/templates';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLockfilePath', () => {
    it('returns correct lockfile path', () => {
      const result = getLockfilePath(templatesDir, 'mytemplate');
      expect(result).toBe('/mock/templates/mytemplate/.lock');
    });
  });

  describe('isLocked', () => {
    it('returns true if lockfile exists', () => {
      fs.existsSync.mockReturnValue(true);
      expect(isLocked(templatesDir, 'mytemplate')).toBe(true);
    });

    it('returns false if lockfile does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      expect(isLocked(templatesDir, 'mytemplate')).toBe(false);
    });
  });

  describe('handler', () => {
    it('exits if template does not exist', async () => {
      templateExists.mockReturnValue(false);
      const exit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      await handler({ template: 'ghost' });
      expect(exit).toHaveBeenCalledWith(1);
    });

    it('logs already locked if lockfile exists', async () => {
      templateExists.mockReturnValue(true);
      fs.existsSync.mockReturnValue(true);
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      await handler({ template: 'mytemplate' });
      expect(log).toHaveBeenCalledWith(expect.stringContaining('already locked'));
    });

    it('writes lockfile when template is not locked', async () => {
      templateExists.mockReturnValue(true);
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {});
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      await handler({ template: 'mytemplate' });
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith(expect.stringContaining('locked'));
    });
  });
});
