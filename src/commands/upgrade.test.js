import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import { handler } from './upgrade.js'
import * as templates from '../templates.js'

vi.mock('fs')
vi.mock('../templates.js')

describe('upgrade command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exits if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false)
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit') })
    await expect(handler({ name: 'ghost', source: '/some/path', dryRun: false })).rejects.toThrow('exit')
    expect(exit).toHaveBeenCalledWith(1)
  })

  it('exits if source path does not exist', async () => {
    templates.templateExists.mockReturnValue(true)
    fs.existsSync.mockReturnValue(false)
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit') })
    await expect(handler({ name: 'mytemplate', source: '/bad/path', dryRun: false })).rejects.toThrow('exit')
    expect(exit).toHaveBeenCalledWith(1)
  })

  it('exits if source directory is empty', async () => {
    templates.templateExists.mockReturnValue(true)
    templates.getTemplatePath.mockReturnValue('/templates/mytemplate')
    fs.existsSync.mockReturnValue(true)
    fs.readdirSync.mockReturnValue([])
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit') })
    await expect(handler({ name: 'mytemplate', source: '/src', dryRun: false })).rejects.toThrow('exit')
    expect(exit).toHaveBeenCalledWith(1)
  })

  it('performs dry run without copying files', async () => {
    templates.templateExists.mockReturnValue(true)
    templates.getTemplatePath.mockReturnValue('/templates/mytemplate')
    fs.existsSync.mockReturnValue(true)
    fs.readdirSync
      .mockReturnValueOnce(['index.js', 'README.md'])
      .mockReturnValueOnce(['index.js'])
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await handler({ name: 'mytemplate', source: '/src', dryRun: true })
    expect(fs.copyFileSync).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Dry run complete'))
  })

  it('copies new files and removes old ones on upgrade', async () => {
    templates.templateExists.mockReturnValue(true)
    templates.getTemplatePath.mockReturnValue('/templates/mytemplate')
    fs.existsSync.mockReturnValue(true)
    fs.readdirSync
      .mockReturnValueOnce(['index.js', 'config.js'])
      .mockReturnValueOnce(['index.js', 'old.js'])
    vi.spyOn(console, 'log').mockImplementation(() => {})
    await handler({ name: 'mytemplate', source: '/src', dryRun: false })
    expect(fs.copyFileSync).toHaveBeenCalledTimes(2)
    expect(fs.unlinkSync).toHaveBeenCalledWith('/templates/mytemplate/old.js')
  })
})
