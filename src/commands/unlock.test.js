import { jest } from '@jest/globals';
import path from 'path';

// Mock fs
const mockExistsSync = jest.fn();
const mockUnlinkSync = jest.fn();

jest.unstable_mockModule('fs', () => ({
  default: {
    existsSync: mockExistsSync,
    unlinkSync: mockUnlinkSync,
  },
}));

// Mock getLockfilePath and isLocked from lock.js
const mockGetLockfilePath = jest.fn();
const mockIsLocked = jest.fn();

jest.unstable_mockModule('../commands/lock.js', () => ({
  getLockfilePath: mockGetLockfilePath,
  isLocked: mockIsLocked,
}));

const { handler } = await import('./unlock.js');

describe('unlock command', () => {
  const templateName = 'my-template';
  const lockfilePath = '/fake/templates/my-template/.stacksnap-lock';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLockfilePath.mockReturnValue(lockfilePath);
  });

  it('removes the lockfile if template is locked', async () => {
    mockIsLocked.mockReturnValue(true);
    mockExistsSync.mockReturnValue(true);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ name: templateName });

    expect(mockIsLocked).toHaveBeenCalledWith(templateName);
    expect(mockUnlinkSync).toHaveBeenCalledWith(lockfilePath);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('unlocked')
    );

    consoleSpy.mockRestore();
  });

  it('warns if template is not currently locked', async () => {
    mockIsLocked.mockReturnValue(false);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ name: templateName });

    expect(mockUnlinkSync).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('not locked')
    );

    consoleSpy.mockRestore();
  });

  it('handles error if unlinkSync throws', async () => {
    mockIsLocked.mockReturnValue(true);
    mockExistsSync.mockReturnValue(true);
    mockUnlinkSync.mockImplementation(() => {
      throw new Error('permission denied');
    });

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await handler({ name: templateName });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to unlock'),
      expect.any(String)
    );

    errorSpy.mockRestore();
  });
});
