const { templateExists } = require('../templates');
const { addDependency, removeDependency, getDependencies } = require('../dependencies');

exports.command = 'dep <template> <action> [name] [version]';
exports.desc = 'Manage dependencies for a template';

exports.builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('action', {
      describe: 'Action to perform',
      choices: ['add', 'remove', 'list'],
    })
    .positional('name', { describe: 'Dependency name', type: 'string' })
    .positional('version', { describe: 'Dependency version', type: 'string', default: '*' });

exports.handler = async (argv) => {
  const { template, action, name, version } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (action === 'list') {
    const deps = getDependencies(template);
    const entries = Object.entries(deps);
    if (entries.length === 0) {
      console.log(`No dependencies for "${template}".`);
    } else {
      console.log(`Dependencies for "${template}":`);
      entries.forEach(([dep, ver]) => console.log(`  ${dep}@${ver}`));
    }
    return;
  }

  if (!name) {
    console.error('Dependency name is required for add/remove actions.');
    process.exit(1);
  }

  if (action === 'add') {
    addDependency(template, name, version);
    console.log(`Added dependency "${name}@${version}" to "${template}".`);
  } else if (action === 'remove') {
    removeDependency(template, name);
    console.log(`Removed dependency "${name}" from "${template}".`);
  }
};
