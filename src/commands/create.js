import chalk from 'chalk'
import ora from 'ora'
import { loadTemplateMeta } from '../templates.js'
import { scaffoldProject } from '../scaffold.js'

export const createCommand = {
  command: 'create <template> <project-name>',
  describe: 'Scaffold a new project from a template',
  builder: (yargs) => {
    yargs
      .positional('template', {
        describe: 'Template name to use',
        type: 'string'
      })
      .positional('project-name', {
        describe: 'Name of the project directory to create',
        type: 'string'
      })
      .option('force', {
        alias: 'f',
        type: 'boolean',
        default: false,
        describe: 'Overwrite existing directory'
      })
  },
  handler: async (argv) => {
    const { template, projectName, force } = argv

    let meta
    try {
      meta = loadTemplateMeta(template)
    } catch {
      console.error(chalk.red(`✖ Template "${template}" not found.`))
      console.error(chalk.dim('Run `stacksnap list` to see available templates.'))
      process.exit(1)
    }

    console.log(chalk.cyan(`\nScaffolding ${chalk.bold(meta.name)} into ./${projectName}\n`))
    if (meta.description) {
      console.log(chalk.dim(meta.description) + '\n')
    }

    const spinner = ora('Copying template files...').start()

    try {
      const targetDir = await scaffoldProject(template, projectName, { force })
      spinner.succeed(chalk.green('Project created successfully!'))
      console.log(`\n  ${chalk.bold('cd')} ${projectName}`)
      if (meta.postInstall) {
        console.log(`  ${chalk.bold(meta.postInstall)}\n`)
      }
    } catch (err) {
      spinner.fail(chalk.red('Scaffolding failed.'))
      console.error(chalk.red(err.message))
      process.exit(1)
    }
  }
}
