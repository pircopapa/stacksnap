import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'

vi.mock('fs')
vi.mock('../config.js', () => ({
  loadConfig: vi.fn().mockResolvedValue({}),
  getTemplatesDir: vi.fn().mockReturnValue('/templates')
}))
vi.mock('../templates.js', () => ({
  templateExists: vi.fn(),
  getTemplatePath: vi.fn().mockReturnValue('/templates/my-tpl')
}))

import { handler, getStashDir } from './stash.js'
import { templateExists } from '../templates.js'
import { loadConfig, getTemplatesDir } from '../config.js'

describe('stash command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fs.mkdirSync = vi.fn()
    fs.existsSync = vi.fn().mockReturnValue(false)
    fs.renameSync = vi.fn()
    fs.writeFileSync = vi.fn()
  })

  it('stashes an existing template', async () => {
    templateExists.mockReturnValue(true)
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await handler({ template: 'my-tpl', message: 'saving for later' })

    expect(fs.renameSync).toHaveBeenCalledWith('/templates/my-tpl', expect.stringContaining('my-tpl'))
    expect(fs.writeFileSync).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Stashed template'))
    consoleSpy.mockRestore()
  })

  it('exits if template does not exist', async () => {
    templateExists.mockReturnValue(false)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit') })

    await expect(handler({ template: 'ghost', message: '' })).rejects.toThrow('exit')
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'))
    errorSpy.mockRestore()
    exitSpy.mockRestore()
  })

  it('exits if template is already stashed', async () => {
    templateExists.mockReturnValue(true)
    fs.existsSync = vi.fn().mockReturnValue(true)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit') })

    await expect(handler({ template: 'my-tpl', message: '' })).rejects.toThrow('exit')
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('already stashed'))
    errorSpy.mockRestore()
    exitSpy.mockRestore()
  })

  it('getStashDir returns sibling .stash directory', () => {
    const result = getStashDir({})
    expect(result).toContain('.stash')
  })
})
