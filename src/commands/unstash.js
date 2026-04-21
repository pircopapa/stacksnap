import fs from 'fs'
import path from 'path'
import { getTemplatesDir, loadConfig } from '../config.js'
import { getStashDir } from './stash.js'

export const command = 'unstash <template>'
export const desc = 'Restore a stashed template back into the active pool'

export const builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name to unstash', type: 'string' })
    .option('list', { alias: 'l', describe: 'List all stashed templates', type: 'boolean', default: false })

export async function handler(argv) {
  const config = await loadConfig()
  const { template, list } = argv

  const stashDir = getStashDir(config)

  if (list) {
    if (!fs.existsSync(stashDir)) {
      console.log('No stashed templates found.')
      return
    }
    const entries = fs.readdirSync(stashDir).filter(f => f.endsWith('.stash.json'))
    if (entries.length === 0) {
      console.log('No stashed templates found.')
      return
    }
    entries.forEach(file => {
      const meta = JSON.parse(fs.readFileSync(path.join(stashDir, file), 'utf8'))
      console.log(`  ${meta.template} — stashed at ${meta.stashedAt}${meta.message ? ` ("${meta.message}")` : ''}`)
    })
    return
  }

  const stashedPath = path.join(stashDir, template)
  const metaPath = path.join(stashDir, `${template}.stash.json`)

  if (!fs.existsSync(stashedPath)) {
    console.error(`No stash found for template "${template}".`)
    process.exit(1)
  }

  const templatesDir = getTemplatesDir(config)
  const dest = path.join(templatesDir, template)

  if (fs.existsSync(dest)) {
    console.error(`Template "${template}" already exists in the active pool. Remove it first.`)
    process.exit(1)
  }

  fs.renameSync(stashedPath, dest)
  if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath)

  console.log(`Unstashed template "${template}" back into active pool.`)
}
