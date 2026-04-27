const { listTemplates } = require('../templates');
const { getVersions, getLatestVersion } = require('../versions');

exports.command = 'versions';
exports.desc = 'List version info for all templates';

exports.builder = yargs =>
  yargs.option('latest-only', {
    alias: 'l',
    type: 'boolean',
    describe: 'Show only the latest version per template',
    default: false,
  });

exports.handler = function (argv) {
  const { latestOnly } = argv;
  const templates = listTemplates();

  if (!templates.length) {
    console.log('No templates found.');
    return;
  }

  let anyVersions = false;

  templates.forEach(name => {
    if (latestOnly) {
      const latest = getLatestVersion(name);
      if (latest) {
        anyVersions = true;
        console.log(`${name}  →  ${latest.version}${latest.note ? ' — ' + latest.note : ''}`);
      }
    } else {
      const all = getVersions(name);
      if (all.length) {
        anyVersions = true;
        console.log(`\n${name}:`);
        all.forEach(v => {
          console.log(`  ${v.version}${v.note ? ' — ' + v.note : ''} (${v.createdAt})`);
        });
      }
    }
  });

  if (!anyVersions) {
    console.log('No version information recorded for any template.');
  }
};
