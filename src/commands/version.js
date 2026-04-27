const { templateExists } = require('../templates');
const { addVersion, getVersions, getLatestVersion, removeVersion } = require('../versions');

exports.command = 'version <template>';
exports.desc = 'Manage versions for a template';

exports.builder = yargs =>
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .option('add', { alias: 'a', type: 'string', describe: 'Add a new version tag' })
    .option('note', { alias: 'n', type: 'string', describe: 'Note for the version', default: '' })
    .option('remove', { alias: 'r', type: 'string', describe: 'Remove a version tag' })
    .option('list', { alias: 'l', type: 'boolean', describe: 'List all versions', default: false })
    .option('latest', { type: 'boolean', describe: 'Show the latest version', default: false });

exports.handler = function (argv) {
  const { template, add, note, remove, list, latest } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" does not exist.`);
    process.exit(1);
  }

  if (add) {
    const entry = addVersion(template, add, note);
    console.log(`Version "${entry.version}" added to "${template}".`);
    return;
  }

  if (remove) {
    const ok = removeVersion(template, remove);
    if (ok) {
      console.log(`Version "${remove}" removed from "${template}".`);
    } else {
      console.error(`Version "${remove}" not found in "${template}".`);
      process.exit(1);
    }
    return;
  }

  if (latest) {
    const v = getLatestVersion(template);
    if (v) {
      console.log(`Latest: ${v.version}${v.note ? ' — ' + v.note : ''} (${v.createdAt})`);
    } else {
      console.log(`No versions recorded for "${template}".`);
    }
    return;
  }

  if (list || (!add && !remove && !latest)) {
    const all = getVersions(template);
    if (!all.length) {
      console.log(`No versions recorded for "${template}".`);
      return;
    }
    all.forEach(v => {
      console.log(`  ${v.version}${v.note ? ' — ' + v.note : ''} (${v.createdAt})`);
    });
  }
};
