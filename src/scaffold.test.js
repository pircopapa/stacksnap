import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import { scaffoldProject, listScaffoldedFiles } from './scaffold.js'
import * as templates from './templates.js'

vi.mock('./templates.js')
vi.mock('fs-extra')

describe('scaffoldProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false)
    await expect(scaffoldProject('ghost', 'my-app')).rejects.toThrow('Template "ghost" not found')
  })

  it('throws if target dir exists and force is false', async () => {
    templates.templateExists.mockReturnValue(true)
    templates.getTemplatePath.mockReturnValue('/templates/node')
    fs.pathExists.mockResolvedValue(true)
    await expect(scaffoldProject('node', 'existing-dir')).rejects.toThrow('already exists')
  })

  it('proceeds if target dir exists and force is true', async () => {
    templates.templateExists.mockReturnValue(true)
    templates.getTemplatePath.mockReturnValue('/templates/node')
    fs.pathExists.mockResolvedValue(true)
    fs.ensureDir.mockResolvedValue()
    fs.readdir.mockResolvedValue([])
    const result = await scaffoldProject('node', 'my-app', { force: true })
    expect(result).toContain('my-app')
  })

  it('skips meta.json when copying files', async () => {
    templates.templateExists.mockReturnValue(true)
    templates.getTemplatePath.mockReturnValue('/templates/node')
    fs.pathExists.mockResolvedValue(false)
    fs.ensureDir.mockResolvedValue()
    fs.readdir.mockResolvedValue([
      { name: 'meta.json', isDirectory: () => false },
      { name: 'index.js', isDirectory: () => false }
    ])
    fs.copy.mockResolvedValue()
    await scaffoldProject('node', 'my-app')
    expect(fs.copy).toHaveBeenCalledTimes(1)
    expect(fs.copy.mock.calls[0][0]).toContain('index.js')
  })
})

describe('listScaffoldedFiles', () => {
  it('returns empty array if dir does not exist', async () => {
    fs.pathExists.mockResolvedValue(false)
    const files = await listScaffoldedFiles('nonexistent')
    expect(files).toEqual([])
  })
})
