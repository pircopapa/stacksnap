import fs from 'fs-extra'
import path from 'path'
import { getTemplatePath, templateExists } from './templates.js'

export async function scaffoldProject(templateName, targetDir, options = {}) {
  if (!templateExists(templateName)) {
    throw new Error(`Template "${templateName}" not found`)
  }

  const templatePath = getTemplatePath(templateName)
  const resolvedTarget = path.resolve(process.cwd(), targetDir)

  if (await fs.pathExists(resolvedTarget) && !options.force) {
    throw new Error(`Directory "${targetDir}" already exists. Use --force to overwrite.`)
  }

  await fs.ensureDir(resolvedTarget)
  await copyTemplateFiles(templatePath, resolvedTarget, options)

  return resolvedTarget
}

async function copyTemplateFiles(templatePath, targetDir, options) {
  const entries = await fs.readdir(templatePath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === 'meta.json') continue

    const srcPath = path.join(templatePath, entry.name)
    const destPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      await fs.ensureDir(destPath)
      await copyTemplateFiles(srcPath, destPath, options)
    } else {
      await fs.copy(srcPath, destPath, { overwrite: options.force ?? false })
    }
  }
}

export async function listScaffoldedFiles(targetDir) {
  const resolvedTarget = path.resolve(process.cwd(), targetDir)
  if (!await fs.pathExists(resolvedTarget)) {
    return []
  }
  return collectFiles(resolvedTarget, resolvedTarget)
}

async function collectFiles(dir, baseDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath, baseDir))
    } else {
      files.push(path.relative(baseDir, fullPath))
    }
  }
  return files
}
