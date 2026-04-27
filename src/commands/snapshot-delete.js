const { snapshotExists, deleteSnapshot, listSnapshots } = require('../snapshots');

const command = 'snapshot-delete <template> <snapshot>';
const desc = 'Delete a saved snapshot of a template';

function builder(yargs) {
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('snapshot', { describe: 'Snapshot name to delete', type: 'string' })
    .option('list', {
      alias: 'l',
      type: 'boolean',
      description: 'List available snapshots for the template instead of deleting',
      default: false,
    });
}

function handler(argv) {
  const { template, snapshot, list } = argv;

  if (list) {
    const snapshots = listSnapshots(template);
    if (snapshots.length === 0) {
      console.log(`No snapshots found for template '${template}'.`);
    } else {
      console.log(`Snapshots for '${template}':`);
      snapshots.forEach(s => console.log(`  - ${s}`));
    }
    return;
  }

  if (!snapshotExists(template, snapshot)) {
    console.error(`Error: Snapshot '${snapshot}' does not exist for template '${template}'.`);
    process.exit(1);
  }

  deleteSnapshot(template, snapshot);
  console.log(`Snapshot '${snapshot}' deleted from template '${template}'.`);
}

module.exports = { command, desc, builder, handler };
