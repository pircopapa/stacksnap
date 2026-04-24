const { templateExists } = require('../templates');
const { addNote, removeNote, getNotes } = require('../notes');

const command = 'note <template>';
const desc = 'Add, remove, or list notes on a template';

const builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .option('add', { alias: 'a', type: 'string', describe: 'Add a note with given text' })
    .option('remove', { alias: 'r', type: 'number', describe: 'Remove note by ID' })
    .option('list', { alias: 'l', type: 'boolean', describe: 'List all notes (default)' });

async function handler(argv) {
  const { template, add, remove } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (add) {
    const note = addNote(template, add);
    console.log(`Note added (id: ${note.id}): ${note.text}`);
    return;
  }

  if (remove !== undefined) {
    const ok = removeNote(template, remove);
    if (ok) {
      console.log(`Note ${remove} removed.`);
    } else {
      console.error(`Note with id ${remove} not found.`);
      process.exit(1);
    }
    return;
  }

  const notes = getNotes(template);
  if (notes.length === 0) {
    console.log(`No notes for "${template}".`);
    return;
  }
  notes.forEach(n => {
    console.log(`[${n.id}] ${n.createdAt}  ${n.text}`);
  });
}

module.exports = { command, desc, builder, handler };
