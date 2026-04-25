const { listTemplates } = require('../templates');
const { getDependencies } = require('../dependencies');

exports.command = 'deps';
exports.desc = 'List all templates and their dependencies';

exports.builder = (yargs) =>
  yargs.option('filter', {
    alias: 'f',
    type: 'string',
    describe: 'Filter by dependency name',
  });

exports.handler = async (argv) => {
  const { filter } = argv;
  const templates = listTemplates();

  if (templates.length === 0) {
    console.log('No templates found.');
    return;
  }

  let found = false;

  templates.forEach((template) => {
    const deps = getDependencies(template);
    const entries = Object.entries(deps);

    if (filter) {
      const match = entries.filter(([dep]) =>
        dep.toLowerCase().includes(filter.toLowerCase())
      );
      if (match.length === 0) return;
      console.log(`${template}:`);
      match.forEach(([dep, ver]) => console.log(`  ${dep}@${ver}`));
      found = true;
    } else {
      if (entries.length === 0) return;
      console.log(`${template}:`);
      entries.forEach(([dep, ver]) => console.log(`  ${dep}@${ver}`));
      found = true;
    }
  });

  if (!found) {
    console.log(filter ? `No templates have dependency matching "${filter}".` : 'No dependencies found.');
  }
};
