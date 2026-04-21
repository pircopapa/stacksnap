import fs from 'fs'
import path from 'path'
import { templateExists, getTemplatePath, loadTemplateMeta } from '../templates.js'
import { loadConfig } from '../config.js'

export const command = 'upgrade <name>'
export const desc = 'Upgrade a template by replacing its files with a newer version from a source path'

export const builder = (yargs) =>
  yargs
    .positional('name', {
      describe: 'Template name to upgrade',
      type: 'string'
    })
    .option('source', {
      alias: 's',
      describe: 'Path to the new template source directory',
      type: 'string',
      demandOption: true
    })
    .option('dry-run', {
      describe: 'Preview what would be changed without applying',
      type: 'boolean',
      default: false
    })

export const handler = async (argv) => {
  const { name, source, dryRun } = argv

  if (!templateExists(name)) {
    console.error(`Template "${name}" does not exist.`)
    process.exit(1)
  }

  if (!fs.existsSync(source)) {
    console.error(`Source path "${source}" does not exist.`)
    process.exit(1)
  }

  const templateDir = getTemplatePath(name)
  const sourceFiles = fs.readdirSync(source)

  if (sourceFiles.length === 0) {
    console.error('Source directory is empty.')
    process.exit(1)
  }

  const existingFiles = fs.readdirSync(templateDir)
  const added = sourceFiles.filter((f) => !existingFiles.includes(f))
  const updated = sourceFiles.filter((f) => existingFiles.includes(f))
  const removed = existingFiles.filter((f) => !sourceFiles.includes(f))

  console.log(`\nUpgrade preview for template: ${name}`)
  added.forEach((f) => console.log(`  + ${f}`))
  updated.forEach((f) => console.log(`  ~ ${f}`))
  removed.forEach((f) => console.log(`  - ${f}`))

  if (dryRun) {
    console.log('\nDry run complete. No changes applied.')
    return
  }

  for (const file of sourceFiles) {
    fs.copyFileSync(path.join(source, file), path.join(templateDir, file))
  }

  for (const file of removed) {
    fs.unlinkSync(path.join(templateDir, file))
  }

  console.log(`\nTemplate "${name}" upgraded successfully.`)
}
