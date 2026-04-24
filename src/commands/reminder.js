const { setReminder, getReminders, removeReminder, getDueReminders } = require('../reminders');
const { templateExists } = require('../templates');

const command = 'reminder <action> [template]';
const describe = 'Manage reminders for templates';

const builder = (yargs) =>
  yargs
    .positional('action', {
      describe: 'Action: add | list | remove | due',
      type: 'string',
      choices: ['add', 'list', 'remove', 'due'],
    })
    .positional('template', {
      describe: 'Template name',
      type: 'string',
    })
    .option('message', { alias: 'm', type: 'string', describe: 'Reminder message' })
    .option('due', { alias: 'd', type: 'string', describe: 'Due date (ISO or human-readable)' })
    .option('index', { alias: 'i', type: 'number', describe: 'Reminder index to remove' });

function handler(argv) {
  const { action, template, message, due, index } = argv;

  if (action === 'due') {
    const dueItems = getDueReminders();
    if (dueItems.length === 0) {
      console.log('No due reminders.');
    } else {
      console.log('Due reminders:');
      dueItems.forEach((r) => console.log(`  [${r.template}] ${r.message} (due: ${r.dueDate})`));
    }
    return;
  }

  if (!template) {
    console.error('Template name is required for this action.');
    process.exit(1);
  }

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (action === 'add') {
    if (!message) {
      console.error('Message is required to add a reminder. Use --message.');
      process.exit(1);
    }
    setReminder(template, message, due || null);
    console.log(`Reminder added to "${template}".`);
  } else if (action === 'list') {
    const list = getReminders(template);
    if (list.length === 0) {
      console.log(`No reminders for "${template}".`);
    } else {
      list.forEach((r, i) => {
        const dueStr = r.dueDate ? ` (due: ${r.dueDate})` : '';
        console.log(`  [${i}] ${r.message}${dueStr}`);
      });
    }
  } else if (action === 'remove') {
    if (index === undefined) {
      console.error('Index is required to remove a reminder. Use --index.');
      process.exit(1);
    }
    const removed = removeReminder(template, index);
    if (removed) {
      console.log(`Reminder ${index} removed from "${template}".`);
    } else {
      console.error(`No reminder at index ${index} for "${template}".`);
      process.exit(1);
    }
  }
}

module.exports = { command, describe, builder, handler };
