import fs from 'fs'
import path from 'path'
import { getTemplatesDir, loadConfig } from '../config.js'
import { templateExists, getTemplatePath } from '../templates.js'

export const command = 'stash <template>'
export const desc = 'Temporarily stash a template out of the active pool'

export const builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name to stash', type: 'string' })
    .option('message', { alias: 'm', describe: 'Optional stash message', type: 'string', default: '' })

export function getStashDir(config) {
  const base = getTemplatesDir(config)
  return path.join(path.dirname(base), '.stash')
}

export async function handler(argv) {
  const config = await loadConfig()
  const { template, message } = argv

  if (!templateExists(template, config)) {
    console.error(`Template "${template}" not found.`)
    process.exit(1)
  }

  const stashDir = getStashDir(config)
  fs.mkdirSync(stashDir, { recursive: true })

  const src = getTemplatePath(template, config)
  const dest = path.join(stashDir, template)

  if (fs.existsSync(dest)) {
    console.error(`Template "${template}" is already stashed.`)
    process.exit(1)
  }

  fs.renameSync(src, dest)

  const metaPath = path.join(stashDir, `${template}.stash.json`)
  fs.writeFileSync(metaPath, JSON.stringify({
    template,
    message,
    stashedAt: new Date().toISOString()
  }, null, 2))

  console.log(`Stashed template "${template}".${message ? ` Note: ${message}` : ''}`)
}
